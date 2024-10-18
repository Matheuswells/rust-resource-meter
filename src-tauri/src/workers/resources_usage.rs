use sysinfo::{ System };
use std::sync::mpsc::Sender;
use std::thread;
use std::time::Duration;
use serde::Serialize;

pub struct SystemUsage {
    pub memory_percent: u16,
    pub cpu_data: CpuData,
}

#[derive(Clone, Serialize)]
pub struct CpuData {
    pub cpu_percent: Vec<u16>,
    pub core_count: u16,
}
fn get_memory_usage(system: &System) -> u16 {
    let total_memory = system.total_memory();
    let used_memory = system.used_memory();
    ((used_memory as f32 / total_memory as f32) * 100.0) as u16
}

fn get_cpu_data(system: &System) -> CpuData {
    let mut cpu_percent: Vec<u16> = Vec::new();
    for cpu in system.cpus() {
        cpu_percent.push(cpu.cpu_usage() as u16);
    }
    CpuData {
        cpu_percent,
        core_count: system.cpus().len() as u16,
    }
}

pub fn monitor_system(tx: Sender<SystemUsage>, refresh_rate: u64) {
    let mut system = System::new_all();

    loop {
        system.refresh_all();
        let memory_percent = get_memory_usage(&system);
        let cpu_data = get_cpu_data(&system);

        tx.send(SystemUsage {
            memory_percent,
            cpu_data,
        }).unwrap();

        thread::sleep(Duration::from_millis(refresh_rate));
    }
}