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

// Register necessary Chart.js components
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

    // Simulated backend function for fetching metrics and handling server commands
    const dummyBackend = async (endpoint) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Dummy data for serverMetrics endpoint
        if (endpoint === 'serverMetrics') {
            return {
                cpu: Math.random() * 100, // Random CPU usage between 0% and 100%
                gpu: Math.random() * 100, // Random GPU usage between 0% and 100%
                network: Math.random() * 100, // Random network usage between 0 MB and 100 MB
                timestamp: Math.floor(Date.now() / 1000), // Current timestamp in seconds
            };
        }
        
        // Dummy responses for other endpoints
        if (endpoint === 'shutdown') return { message: 'Server is shutting down...' };
        if (endpoint === 'restart') return { message: 'Server is restarting...' };
        
        throw new Error(`Endpoint ${endpoint} not found`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dummyBackend("serverMetrics"); //Util.callBackend("serverMetrics");
                console.log('Backend Response:', response); // Log the response for debugging

                const { cpu, gpu, network, timestamp } = response;
                
                // Convert timestamp to milliseconds and format time
                const timeLabel = new Date(timestamp * 1000).toLocaleTimeString();

                setCpuData(prevData => [...prevData, cpu].slice(-10)); // Keep only last 10 data points
                setGpuData(prevData => [...prevData, gpu].slice(-10)); // Keep only last 10 data points
                setNetworkData(prevData => [...prevData, network].slice(-10)); // Keep only last 10 data points
                setLabels(prevLabels => [...prevLabels, timeLabel].slice(-10)); // Keep only last 10 labels
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    // Handle server shutdown
    const handleShutdown = async () => {
        try {
            await dummyBackend("shutdown"); //Util.callBackend("shutdown");
            alert('Server is shutting down...');
        } catch (error) {
            console.error('Error shutting down server:', error);
        }
    };

    // Handle server restart
    const handleRestart = async () => {
        try {
            await dummyBackend("restart"); //Util.callBackend("restart");
            alert('Server is restarting...');
        } catch (error) {
            console.error('Error restarting server:', error);
        }
    };

    // Toggle management options visibility
    const toggleManageOptions = () => setShowManageOptions(!showManageOptions);

    // Chart configuration options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false, // Disable animation for instant updates
        scales: {
            y: {
                suggestedMin: 0, // Ensures consistent scale
                suggestedMax: 100, // Ensures consistent scale
            }
        },
        plugins: {
            legend: { position: 'top' }, // Position legend at the top
        },
        elements: {
            line: { tension: 0 }, // Sharp lines instead of curves
        },
    };

    // Generate chart data dynamically
    const generateChartData = (label, data, color) => ({
        labels, // X-axis labels
        datasets: [{
            label, // Dataset label
            data, // Data points
            borderColor: color, // Line color
            backgroundColor: color + '33', // Slight transparency for fill
            fill: true, // Enable area fill
        }],
    });

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-6">Server Monitor</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* CPU Usage Chart */}
                <div className="bg-white p-4 shadow-lg rounded-xl">
                    <h2 className="text-xl font-semibold mb-2">CPU Usage</h2>
                    <div className="h-64">
                        <Line data={generateChartData('CPU Usage (%)', cpuData, '#4CAF50')} options={chartOptions} />
                    </div>
                </div>
                {/* GPU Usage Chart */}
                <div className="bg-white p-4 shadow-lg rounded-xl">
                    <h2 className="text-xl font-semibold mb-2">GPU Usage</h2>
                    <div className="h-64">
                        <Line data={generateChartData('GPU Usage (%)', gpuData, '#3B82F6')} options={chartOptions} />
                    </div>
                </div>
                {/* Network Usage Chart */}
                <div className="bg-white p-4 shadow-lg rounded-xl">
                    <h2 className="text-xl font-semibold mb-2">Network Usage</h2>
                    <div className="h-64">
                        <Line data={generateChartData('Network Usage (MB)', networkData, '#F59E0B')} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Management Buttons */}
            <div className="text-center">
                <button
                    onClick={toggleManageOptions}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition"
                >
                    {showManageOptions ? 'Hide Manage Options' : 'Manage Backend'}
                </button>
            </div>

            {showManageOptions && (
                <div className="mt-4 flex justify-center gap-4">
                    <button
                        onClick={handleShutdown}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
                    >
                        Shutdown Server
                    </button>
                    <button
                        onClick={handleRestart}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
                    >
                        Restart Server
                    </button>
                </div>
            )}
        </div>
    );
};

export default ServerMonitor;
