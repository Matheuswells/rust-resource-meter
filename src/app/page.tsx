'use client';
import React, {useEffect, useState} from "react";
import {invoke} from '@tauri-apps/api/tauri'
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CartesianGrid, Line, LineChart, XAxis, YAxis} from "recharts"
import {AppBar} from "@/components/AppBar/appbar";

interface CpuData {
    cpu_percent: Array<number>;
    core_count: number;
}

interface AppState {
    memory_usage: number;
    cpu_data: CpuData
}

interface ResourcesData {
    cpu: number;
    memory: number;
    time: string;
}

interface ChartsData {
    resources: Array<ResourcesData>
}


export default function Home() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const defaultChartData: Array<ResourcesData> = Array.from({length: 60}, (_, index) => {
        return {
            cpu: 0,
            memory: 0,
            time: new Date().toISOString()
        }
    });

    const [appState, setAppState] = useState<AppState | null>(null);

    const [resourcesChartData, setResourcesChartData] = useState<ChartsData>({resources: defaultChartData});

    async function fetchAppState() {
        try {
            const state: AppState = await invoke("get_app_state");
            setAppState(state);
            const update: ChartsData = resourcesChartData;
            update.resources.push({
                cpu: state.cpu_data.cpu_percent.reduce((a, b) => a + b) / state.cpu_data.core_count,
                memory: state.memory_usage,
                time: new Date().toISOString()
            });
            setResourcesChartData(update);

            if (update.resources.length > 60) {
                update.resources.shift();
                setResourcesChartData(update);
            }

        } catch (error) {
            console.error("Failed to fetch app state:", error);
        }
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchAppState();
        }, 200);

        return () => clearInterval(intervalId);
    }, []);

    const chartConfig = {
        cpu: {
            label: "CPU",
            color: "hsl(var(--chart-1))",
        },
        memory: {
            label: "Memory",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig

    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>("cpu")

    //total = all cpu cores summed up / core count and memory usage
    const total = {
        cpu: appState ? appState.cpu_data.cpu_percent.reduce((a, b) => a + b) / appState.cpu_data.core_count : 0,
        memory: appState ? appState.memory_usage : 0
    }

    return (
        <>
            <AppBar/>

            <div className="flex">

            {/*<Card className="mx-5 mt-5 flex flex-col ">*/}
            {/*    <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">*/}
            {/*        <div className="flex flex-1 flex-col justify-start gap-1 px-6 py-5 sm:py-6">*/}
            {/*            <CardTitle>CPU Core Map</CardTitle>*/}
            {/*            <CardDescription>Showing processor threads usage</CardDescription>*/}
            {/*        </div>*/}
            {/*    </CardHeader>*/}
            {/*    <CardContent className="px-2 sm:p-6">hello world</CardContent>*/}
            {/*</Card>*/}


                {appState ? (
                    <Card className="mx-5 mt-5 flex flex-1 flex-col">
                        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                                <CardTitle>Resources usage</CardTitle>
                                <CardDescription>Showing total resources being used now</CardDescription>
                            </div>
                            <div className="flex">
                                {["cpu", "memory"].map((key) => {
                                    const chart = key as keyof typeof chartConfig
                                    return (
                                        <button
                                            key={chart}
                                            data-active={activeChart === chart}
                                            className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6 w-[150px]"
                                            onClick={() => setActiveChart(chart)}
                                        >
                                            <span className="text-xs text-muted-foreground">
                                              {chartConfig[chart].label}
                                            </span>
                                            <span className="text-lg font-bold leading-none sm:text-3xl">
                                                {total[chart].toFixed(0) + '%'}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </CardHeader>
                        <CardContent className="px-2 sm:p-6">
                            <ChartContainer
                                config={chartConfig}
                                className="aspect-auto h-[250px] w-full min-h-0">
                                <LineChart
                                    accessibilityLayer
                                    data={resourcesChartData.resources}
                                    margin={{
                                        left: 12,
                                        right: 12,
                                    }}>
                                    <CartesianGrid vertical={false}/>
                                    <XAxis
                                        dataKey="time"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={32}
                                        tickFormatter={(value) => {
                                            const date = new Date(value)
                                            return date.toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            })
                                        }}
                                    />

                                    <YAxis domain={[0, 100]}>
                                        <ChartTooltipContent
                                            className="w-[150px]"
                                            nameKey="cpu"
                                        />
                                    </YAxis>
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                className="w-[150px]"
                                                nameKey={activeChart}
                                                labelFormatter={(value) => {
                                                    return new Date(value).toLocaleDateString("en-US", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                    })
                                                }}
                                            />
                                        }
                                    />
                                    <Line
                                        dataKey={activeChart}
                                        type="monotone"
                                        stroke={`var(--color-${activeChart})`}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    ) : (
                    <p>Loading...</p>
                    )}
            </div>
            </>
            );
            }