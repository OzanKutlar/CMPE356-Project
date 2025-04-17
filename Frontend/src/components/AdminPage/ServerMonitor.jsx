import {useEffect, useState} from 'react';
import {Line} from 'react-chartjs-2';
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
import Info from "../Global/PopUps/Info.jsx";
import Util from "../../Util.js";

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
    const [ramData, setRamData] = useState([]);
    const [networkData, setNetworkData] = useState([]);
    const [labels, setLabels] = useState([]);
    const [showManageOptions, setShowManageOptions] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [popUpText, setPopUpText] = useState('');
    const [popUpType, setPopUpType] = useState('');


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Util.callBackend("admin/serverMetrics", {userID: Util.savedUser.id});
                console.log('Backend Response:', response);

                if (response.msg === "error") {
                    alert(response.message);
                    Util.navigateTo("home");
                    throw new Error(response.message || 'Failed to send verification code');
                }


                setCpuData(prevData => [...prevData, response.cpu.replace("%", "")].slice(-10)); // Keep only last 10 data points
                setRamData(prevData => [...prevData, response.ram].slice(-10)); // Keep only last 10 data points
                setNetworkData(prevData => [...prevData, response.network].slice(-10)); // Keep only last 10 data points
                setLabels(prevLabels => [...prevLabels, ""].slice(-10)); // Keep only last 10 labels
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        const interval = setInterval(fetchData, 2000); // Fetch data every 5 seconds
        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    // Handle server shutdown
    const handleShutdown = async () => {
        try {
            let response = await Util.callBackend("admin/shutdown", {
                adminId: Util.savedUser.id
            });

            if(response.msg === "success"){
                setPopUpText("Server is shutting down");
                setPopUpType("Info")
                setShowPopup(true);
            }
            else{
                setPopUpText("Error : " + response.message)
                setPopUpType("Error")
                setShowPopup(true);
            }
        } catch (err) {
            setPopUpText("Error : " + err.message)
            setPopUpType("Error")
            setShowPopup(true);
            console.error(err);
        }
    };

    // Handle server restart
    const handleRestart = async () => {
        try {
            let response = await Util.callBackend("admin/restart", {
                userID: Util.savedUser.id
            });

            if(response.msg === "success"){
                setPopUpText("Server is restarting");
                setPopUpType("Info")
                setShowPopup(true);
            }
            else{
                setPopUpText("Error : " + response.message)
                setPopUpType("Error")
                setShowPopup(true);
            }
        } catch (err) {
            setPopUpText("Error : " + err.error)
            setPopUpType("Error")
            setShowPopup(true);
            console.error(err);
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
            legend: {position: 'top'}, // Position legend at the top
        },
        elements: {
            line: {tension: 0}, // Sharp lines instead of curves
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
            {showPopup && (
                <Info popUpText={popUpText} popUpType={popUpType} setShowPopup={setShowPopup} />
            )}
            <h1 className="text-3xl font-bold text-center mb-6">Server Monitor</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* CPU Usage Chart */}
                <div className="bg-white p-4 shadow-lg rounded-xl">
                    <h2 className="text-xl font-semibold mb-2">CPU Usage</h2>
                    <div className="h-64">
                        <Line data={generateChartData('CPU Usage (%)', cpuData, '#4CAF50')} options={chartOptions}/>
                    </div>
                </div>
                {/* GPU Usage Chart */}
                <div className="bg-white p-4 shadow-lg rounded-xl">
                    <h2 className="text-xl font-semibold mb-2">GPU Usage</h2>
                    <div className="h-64">
                        <Line data={generateChartData('RAM Usage (GB)', ramData, '#3B82F6')} options={chartOptions}/>
                    </div>
                </div>
                {/* Network Usage Chart */}
                <div className="bg-white p-4 shadow-lg rounded-xl">
                    <h2 className="text-xl font-semibold mb-2">Network Usage</h2>
                    <div className="h-64">
                        <Line data={generateChartData('Network Usage (MB/s)', networkData, '#F59E0B')}
                              options={chartOptions}/>
                    </div>
                </div>
            </div>

            {/* Management Buttons */}
            <div className="text-center">
                <button
                    onClick={toggleManageOptions}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition"
                >
                    {showManageOptions ? 'Hide Management Options' : 'Show Management Options'}
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
