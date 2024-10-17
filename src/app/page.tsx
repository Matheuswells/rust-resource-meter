'use client';
import React, {useEffect, useState} from "react";
import {invoke} from '@tauri-apps/api/tauri'
// import {TableCaption, TableHead, TableRow, TableHeader, TableBody, TableCell, Table} from "@/components/ui/table";
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSubTrigger,
    MenubarSubContent,
    MenubarSub
} from "@/components/ui/menubar";
import {useTheme} from "next-themes";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CartesianGrid, Line, LineChart, XAxis, YAxis} from "recharts"

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
    cpu2: number;
    memory: number;
    time: string;
}

interface ChartsData {
    resources: Array<ResourcesData>
}


export default function Home() {
    const [appState, setAppState] = useState<AppState | null>(null);
    const {setTheme} = useTheme();
    const [resourcesChartData, setResourcesChartData] = useState<ChartsData>({resources: []});
    const [key, setKey] = useState(0);

    function toggleDarkTheme() {
        setTheme('dark')
    }

    function toggleLightTheme() {
        setTheme('light')
    }

    useEffect(() => {
        async function fetchAppState() {
            try {
                const state: AppState = await invoke("get_app_state");
                setAppState(state);

                console.log('state', state)
                //push data to chart
                const update: ChartsData = resourcesChartData;
                update.resources.push({
                    cpu: state.cpu_data.cpu_percent[0],
                    cpu2: state.cpu_data.cpu_percent[15],
                    memory: state.memory_usage,
                    time: new Date().toISOString()
                });
                setResourcesChartData(update);

                // if more tha 60 itens remove the first one
                if (update.resources.length > 60) {
                    update.resources.shift();
                    setResourcesChartData(update);
                }

                console.log('update', update)
            } catch (error) {
                console.error("Failed to fetch app state:", error);
            }
        }
        const intervalId = setInterval(() => {
            fetchAppState();
        }, 200);

        console.log('resourcesChartData', resourcesChartData)
        return () => clearInterval(intervalId);
    }, []);

    const getColor = (value: number) => {
        if (value === 0) return '#282828';
        if (value <= 25) return 'green';
        if (value <= 50) return 'yellow';
        if (value <= 75) return 'orange';
        return 'red';
    };

    const coreDivSize = 50;

    const chartConfig = {
        views: {
            label: "Page Views",
        },
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
    const total = React.useMemo(
        () => ({
            cpu: resourcesChartData.resources.reduce((acc, curr) => acc + curr.cpu, 0),
            memory: resourcesChartData.resources.reduce((acc, curr) => acc + curr.memory, 0),
        }),
        []
    )

    return (
        <><Menubar>
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem>New Window</MenubarItem>
                    <MenubarSeparator/>
                    <MenubarItem>Share</MenubarItem>
                    <MenubarSeparator/>
                    <MenubarItem>Print</MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Options</MenubarTrigger>
                <MenubarContent>
                    <MenubarSub>
                        <MenubarSubTrigger>Theme</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem
                                onClick={toggleDarkTheme}>Dark <MenubarShortcut>Ctrl+D</MenubarShortcut></MenubarItem>
                            <MenubarItem
                                onClick={toggleLightTheme}>Light <MenubarShortcut>Ctrl+L</MenubarShortcut></MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                </MenubarContent>
            </MenubarMenu>

        </Menubar>
            <div className="table-container">
                {appState ? (
                    <>
                        <Card>
                            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                                    <CardTitle>Resources usage</CardTitle>
                                    <CardDescription>
                                        Showing total resources being used now
                                    </CardDescription>
                                </div>
                                <div className="flex">
                                    {["cpu", "memory"].map((key) => {
                                        const chart = key as keyof typeof chartConfig
                                        return (
                                            <button
                                                key={chart}
                                                data-active={activeChart === chart}
                                                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                                                onClick={() => setActiveChart(chart)}
                                            >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                                                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </CardHeader>
                            <CardContent className="px-2 sm:p-6">
                                <ChartContainer
                                    config={chartConfig}
                                    className="aspect-auto h-[250px] w-full"
                                >
                                    <LineChart
                                        accessibilityLayer
                                        data={resourcesChartData.resources}
                                        margin={{
                                            left: 12,
                                            right: 12,
                                        }}
                                    >
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
                                                    nameKey="cpu"
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
                                        <Line
                                            dataKey={'cpu2'}
                                            type="monotone"
                                            stroke={`var(--color-${'memory'})`}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/*<Table>*/}
                        {/*    <TableCaption>Resources usage infos</TableCaption>*/}
                        {/*    <TableHeader>*/}
                        {/*        <TableRow>*/}
                        {/*            <TableHead className="w-[100px]">Invoice</TableHead>*/}
                        {/*            <TableHead>Status</TableHead>*/}
                        {/*            <TableHead>Method</TableHead>*/}
                        {/*            <TableHead className="text-right">Amount</TableHead>*/}
                        {/*        </TableRow>*/}
                        {/*    </TableHeader>*/}
                        {/*    <TableBody>*/}
                        {/*        <TableRow>*/}
                        {/*            <TableCell className="font-medium">INV001</TableCell>*/}
                        {/*            <TableCell>Paid</TableCell>*/}
                        {/*            <TableCell>Credit Card</TableCell>*/}
                        {/*            <TableCell className="text-right">$250.00</TableCell>*/}
                        {/*        </TableRow>*/}
                        {/*    </TableBody>*/}
                        {/*</Table>*/}
                        <div id="cpu-usage" style={{
                            display: 'inline-grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '1px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '5px',
                            border: '2px solid #3d3d3d',
                            borderRadius: '10px'
                        }}>
                            {appState.cpu_data.cpu_percent.map((value, index) => (
                                <div key={index} style={{
                                    width: coreDivSize + 'px',
                                    height: coreDivSize + 'px',
                                    backgroundColor: getColor(value),
                                    border: '1px solid #000000',
                                    borderRadius: '50%',
                                    transition: 'background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}></div>
                            ))}
                        </div>
                    </>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </>
    );
}