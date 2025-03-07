import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
//import Util from '../../Util';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ServerMonitor = () => {
    const [cpuData, setCpuData] = useState([]);
    const [gpuData, setGpuData] = useState([]);
    const [networkData, setNetworkData] = useState([]);
    const [labels, setLabels] = useState([]);
    const [showManageOptions, setShowManageOptions] = useState(false);

    const dummyBackend = async (endpoint) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        // Dummy data for /api/metrics endpoint
        if (endpoint === 'serverMetrics') {
            const dummyData = {
                cpu: Math.random() * 100, // Random CPU usage between 0% and 100%
                gpu: Math.random() * 100, // Random GPU usage between 0% and 100%
                network: Math.random() * 100, // Random network usage between 0 MB and 100 MB
                timestamp: Math.floor(Date.now() / 1000), // Current timestamp in seconds
            };
            return dummyData;
        }

        // Dummy responses for other endpoints
        if (endpoint === 'shutdown') {
            return { message: 'Server is shutting down...' };
        }

        if (endpoint === 'restart') {
            return { message: 'Server is restarting...' };
        }

        throw new Error(`Endpoint ${endpoint} not found`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use the callBackend function to fetch metrics
                const response = await dummyBackend("serverMetrics");//Util.callBackend('serverMetrics');
                console.log('Backend Response:', response); // Log the response for debugging

                const { cpu, gpu, network, timestamp } = response;

                // Ensure the timestamp is a valid number
                if (typeof timestamp !== 'number' || isNaN(timestamp)) {
                    console.error('Invalid timestamp:', timestamp);
                    return;
                }

                // Convert timestamp to milliseconds if it's in seconds
                const timestampInMilliseconds = timestamp * 1000;

                // Validate the timestamp again after conversion
                if (typeof timestampInMilliseconds !== 'number' || isNaN(timestampInMilliseconds)) {
                    console.error('Invalid timestamp after conversion:', timestampInMilliseconds);
                    return;
                }

                // Format the time for the label
                const timeLabel = new Date(timestampInMilliseconds).toLocaleTimeString();

                setCpuData(prevData => [...prevData, cpu].slice(-10));
                setGpuData(prevData => [...prevData, gpu].slice(-10));
                setNetworkData(prevData => [...prevData, network].slice(-10));
                setLabels(prevLabels => [...prevLabels, timeLabel].slice(-10));
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleShutdown = async () => {
        try {
            // Use the callBackend function to send shutdown request
            await dummyBackend("shutdown"); //Util.callBackend('shutdown');
            alert('Server is shutting down...');
        } catch (error) {
            console.error('Error shutting down server:', error);
        }
    };

    const handleRestart = async () => {
        try {
            // Use the callBackend function to send restart request
            await dummyBackend("restart"); //Util.callBackend('restart');
            alert('Server is restarting...');
        } catch (error) {
            console.error('Error restarting server:', error);
        }
    };

    const toggleManageOptions = () => {
        setShowManageOptions(!showManageOptions);
    };

    // Data for CPU Usage Graph
    const cpuChartData = {
        labels,
        datasets: [
            {
                label: 'CPU Usage (%)',
                data: cpuData,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
            },
        ],
    };

    // Data for GPU Usage Graph
    const gpuChartData = {
        labels,
        datasets: [
            {
                label: 'GPU Usage (%)',
                data: gpuData,
                borderColor: 'rgba(153, 102, 255, 1)',
                fill: false,
            },
        ],
    };

    // Data for Network Usage Graph
    const networkChartData = {
        labels,
        datasets: [
            {
                label: 'Network Usage (MB)',
                data: networkData,
                borderColor: 'rgba(255, 159, 64, 1)',
                fill: false,
            },
        ],
    };

    // Common options for all charts
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Allow charts to be smaller
        animation: {
            duration: 1000, // Animation duration in milliseconds
            easing: 'easeInOutQuad', // Smooth easing function
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: '', // Title can be customized for each chart
            },
        },
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Server Monitor</h1>

            {/* Charts Side by Side */}
            <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
                {/* CPU Usage Graph */}
                <div style={{ flex: 1, height: '300px' }}>
                    <h2>CPU Usage</h2>
                    <Line
                        data={cpuChartData}
                        options={{
                            ...chartOptions,
                            plugins: {
                                ...chartOptions.plugins,
                                title: { ...chartOptions.plugins.title, text: 'CPU Usage Over Time' },
                            },
                        }}
                    />
                </div>

                {/* GPU Usage Graph */}
                <div style={{ flex: 1, height: '300px' }}>
                    <h2>GPU Usage</h2>
                    <Line
                        data={gpuChartData}
                        options={{
                            ...chartOptions,
                            plugins: {
                                ...chartOptions.plugins,
                                title: { ...chartOptions.plugins.title, text: 'GPU Usage Over Time' },
                            },
                        }}
                    />
                </div>

                {/* Network Usage Graph */}
                <div style={{ flex: 1, height: '300px' }}>
                    <h2>Network Usage</h2>
                    <Line
                        data={networkChartData}
                        options={{
                            ...chartOptions,
                            plugins: {
                                ...chartOptions.plugins,
                                title: { ...chartOptions.plugins.title, text: 'Network Usage Over Time' },
                            },
                        }}
                    />
                </div>
            </div>

            {/* Buttons */}
            <div style={{ textAlign: 'center' }}>
                <button
                    onClick={toggleManageOptions}
                    style={{
                        marginRight: '10px',
                        padding: '10px 20px',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    {showManageOptions ? 'Hide Manage Options' : 'Manage Backend'}
                </button>

                {showManageOptions && (
                    <>
                        <button
                            onClick={handleShutdown}
                            style={{
                                marginRight: '10px',
                                padding: '10px 20px',
                                backgroundColor: '#ff4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Shutdown Server
                        </button>
                        <button
                            onClick={handleRestart}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#44aaff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Restart Server
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ServerMonitor;