import { useState, useEffect } from 'react';
import ApexCharts from 'apexcharts';

import Sidebar from '../../Sidebar';

export default function Revenue() {
  const [activeTab, setActiveTab] = useState('revenue');

  useEffect(() => {
    const getChartOptions = () => {
      return {
        series: [35.1, 23.5, 12.4, 10, 5.4],
        colors: ['#1C64F2', '#16BDCA', '#FDBA8C', '#E74694', '#AAAA24'],
        chart: {
          height: 320,
          width: '100%',
          type: 'donut',
        },
        stroke: {
          colors: ['transparent'],
          lineCap: '',
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                name: {
                  show: true,
                  fontFamily: 'Inter, sans-serif',
                  offsetY: 20,
                },
                total: {
                  showAlways: true,
                  show: true,
                  label: 'Tổng doanh thu',
                  fontFamily: 'Inter, sans-serif',
                  formatter: function (w) {
                    const sum = w.globals.seriesTotals.reduce((a, b) => {
                      return a + b;
                    }, 0);
                    return '$' + sum + 'k';
                  },
                },
                value: {
                  show: true,
                  fontFamily: 'Inter, sans-serif',
                  offsetY: -20,
                  formatter: function (value) {
                    return value + 'k';
                  },
                },
              },
              size: '80%',
            },
          },
        },
        grid: {
          padding: {
            top: -2,
          },
        },
        labels: ['Iphone', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo'],
        dataLabels: {
          enabled: false,
        },
        legend: {
          position: 'bottom',
          fontFamily: 'Inter, sans-serif',
        },
        yaxis: {
          labels: {
            formatter: function (value) {
              return value + 'k';
            },
          },
        },
        xaxis: {
          labels: {
            formatter: function (value) {
              return value + 'k';
            },
          },
          axisTicks: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
        },
      };
    };

    if (
      document.getElementById('donut-chart') &&
      typeof ApexCharts !== 'undefined'
    ) {
      const chart = new ApexCharts(
        document.getElementById('donut-chart'),
        getChartOptions()
      );
      chart.render();

      // Get all the checkboxes by their class name
      const checkboxes = document.querySelectorAll(
        '#devices input[type="checkbox"]'
      );

      // Function to handle the checkbox change event
      function handleCheckboxChange(event, chart) {
        const checkbox = event.target;
        if (checkbox.checked) {
          switch (checkbox.value) {
            case 'desktop':
              chart.updateSeries([15.1, 22.5, 4.4, 8.4]);
              break;
            case 'tablet':
              chart.updateSeries([25.1, 26.5, 1.4, 3.4]);
              break;
            case 'mobile':
              chart.updateSeries([45.1, 27.5, 8.4, 2.4]);
              break;
            default:
              chart.updateSeries([55.1, 28.5, 1.4, 5.4]);
          }
        } else {
          chart.updateSeries([35.1, 23.5, 2.4, 5.4]);
        }
      }

      // Attach the event listener to each checkbox
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', (event) =>
          handleCheckboxChange(event, chart)
        );
      });
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="m-4 w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
        <div className="flex justify-between mb-3">
          <div className="flex justify-center items-center">
            <h4 className="text-xl font-bold leading-none text-gray-900 dark:text-white pe-1">
              Doanh thu của cửa hàng
            </h4>
          </div>
          <div>
            <button
              type="button"
              data-tooltip-target="data-tooltip"
              data-tooltip-placement="bottom"
              className="hidden sm:inline-flex items-center justify-center text-gray-500 w-8 h-8 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm"
            >
              <svg
                className="w-3.5 h-3.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 16 18"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"
                />
              </svg>
              <span className="sr-only">Download data</span>
            </button>
            <div
              id="data-tooltip"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
            >
              Download CSV
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          </div>
        </div>
        <form className="flex flex-col items-center justify-center my-4">
          <div
            id="date-range-picker"
            date-rangepicker
            className="flex items-center mb-4"
          >
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                </svg>
              </div>
              <input
                id="datepicker-range-start"
                name="start"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Ngày bắt đầu"
              />
            </div>
            <span className="mx-4 text-gray-500">-</span>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                </svg>
              </div>
              <input
                id="datepicker-range-end"
                name="end"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Ngày kết thúc"
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Thống kê
          </button>
        </form>
        <div className="py-6" id="donut-chart"></div>
      </div>
    </div>
  );
}
