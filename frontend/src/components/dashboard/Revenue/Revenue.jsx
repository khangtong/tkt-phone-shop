import { useState, useEffect } from "react";
import ApexCharts from "apexcharts";
import { Datepicker } from "flowbite-react";

import Sidebar from "../../Sidebar";

export default function Revenue() {
  const [activeTab, setActiveTab] = useState("revenue");

  // Format price (VND)
  const formatPrice = (price) => {
    const numberPrice = Number(price);
    if (Number.isNaN(numberPrice)) return "0 ₫";
    return numberPrice.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });
  };

  // Generate random color
  const getMyColor = () => {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return "#" + n.slice(0, 6);
  };

  function handleGetStatistic(e) {
    e.preventDefault();
    if (document.getElementById("donut-chart"))
      document.getElementById("donut-chart").remove();

    const start = e.target[0].value;
    const end = e.target[1].value;

    const startDate = new Date(
      start.split(" ")[3],
      +start.split(" ")[2].slice(0, -1) - 1,
      start.split(" ")[0]
    );
    const endDate = new Date(
      end.split(" ")[3],
      +end.split(" ")[2].slice(0, -1) - 1,
      end.split(" ")[0]
    );

    async function fetchStatistic() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/statistics?start=${startDate}&end=${endDate}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log("Statistic data:", data);

        if (response.status === 200) {
          document
            .querySelector(".w-full.bg-white")
            .insertAdjacentHTML(
              "beforeend",
              '<div className="py-6" id="donut-chart"></div>'
            );

          const getChartOptions = () => {
            return {
              series: data.revenueOnCategory.map((item) => item.totalRevenue),
              colors: data.revenueOnCategory.map((item) => getMyColor()),
              chart: {
                height: 320,
                width: "100%",
                type: "donut",
              },
              stroke: {
                colors: ["transparent"],
                lineCap: "",
              },
              plotOptions: {
                pie: {
                  donut: {
                    labels: {
                      show: true,
                      name: {
                        show: true,
                        fontFamily: "Inter, sans-serif",
                        offsetY: 20,
                      },
                      total: {
                        showAlways: true,
                        show: true,
                        label: "Tổng doanh thu",
                        fontFamily: "Inter, sans-serif",
                        formatter: function (w) {
                          const sum = w.globals.seriesTotals.reduce((a, b) => {
                            return a + b;
                          }, 0);
                          return formatPrice(sum);
                        },
                      },
                      value: {
                        show: true,
                        fontFamily: "Inter, sans-serif",
                        offsetY: -20,
                        formatter: function (value) {
                          return value + "k";
                        },
                      },
                    },
                    size: "80%",
                  },
                },
              },
              grid: {
                padding: {
                  top: -2,
                },
              },
              labels: data.revenueOnCategory.map((item) => item.category),
              dataLabels: {
                enabled: false,
              },
              legend: {
                position: "bottom",
                fontFamily: "Inter, sans-serif",
              },
              yaxis: {
                labels: {
                  formatter: function (value) {
                    return formatPrice(value);
                  },
                },
              },
              xaxis: {
                labels: {
                  formatter: function (value) {
                    return formatPrice(value);
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
            document.getElementById("donut-chart") &&
            typeof ApexCharts !== "undefined"
          ) {
            const chart = new ApexCharts(
              document.getElementById("donut-chart"),
              getChartOptions()
            );

            chart.render();
          }
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error fetching statistic:", error);
      }
    }

    fetchStatistic();
  }

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
        </div>
        <form
          onSubmit={handleGetStatistic}
          className="flex flex-col items-center justify-center my-4"
        >
          <div className="flex items-center gap-4 mb-4">
            <Datepicker
              title="Chọn ngày bắt đầu"
              language="vn-VN"
              labelTodayButton="Hôm nay"
              labelClearButton="Reset"
            />
            -
            <Datepicker
              title="Chọn ngày kết thúc"
              language="vn-VN"
              labelTodayButton="Hôm nay"
              labelClearButton="Reset"
            />
          </div>
          <button
            type="submit"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Thống kê
          </button>
        </form>
      </div>
    </div>
  );
}
