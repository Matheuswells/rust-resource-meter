// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod workers;

use std::sync::{Arc, Mutex};
use std::thread;
use serde::{Serialize};
use crate::workers::resources_usage::{CpuData, SystemUsage};

#[derive(Clone, Serialize)]
pub struct AppState {
  memory_usage: u16,
  cpu_data: CpuData
}

#[tauri::command]
fn get_app_state(state: tauri::State<'_, Arc<Mutex<AppState>>>) -> AppState {
  let state = state.lock().unwrap();
  state.clone()
}

fn update_state(state: Arc<Mutex<AppState>>, system_usage: SystemUsage) -> bool {
  let mut state = state.lock().unwrap();
  state.memory_usage = system_usage.memory_percent;
  state.cpu_data = system_usage.cpu_data;
  true
}

fn main() {
  let default_refresh_rate = 200;
  let state = Arc::new(Mutex::new(AppState {
    memory_usage: 0,
    cpu_data: CpuData {
      cpu_percent: vec![],
      core_count: 0
    }
  }));
  let (resources_usage_tx, resources_usage_rx) = std::sync::mpsc::channel::<SystemUsage>();

  {
    thread::spawn(move || {
      workers::resources_usage::monitor_system(resources_usage_tx, default_refresh_rate);
    });

    let state = Arc::clone(&state);
    thread::spawn(move || {
      loop {
        let system_usage = resources_usage_rx.recv().unwrap();
        let _ = update_state(Arc::clone(&state), system_usage);
        thread::sleep(std::time::Duration::from_millis(default_refresh_rate));
      }
    });
  }

  tauri::Builder::default()
      .manage(state)
      .invoke_handler(tauri::generate_handler![get_app_state])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}