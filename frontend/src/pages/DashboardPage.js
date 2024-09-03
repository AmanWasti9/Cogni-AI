import { Container } from "@mui/material";
import "./DashboardPage.css";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { getAuth } from "firebase/auth";

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
];

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [chartData, setChartData] = useState([]);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        // Replace 'user.uid' with the actual UID of the logged-in user if available
        const userDocRef = doc(firestore, "Summaries", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userSummaries = userDocSnapshot.data().Summaries || [];

          console.log("Fetched summaries:", userSummaries);
          setSummaries(userSummaries);
          const transformedData = userSummaries.chartData.map(
            (item, index) => ({
              name: item.name || `Page ${index + 1}`,
              uv: item.likes.length() || 0,
              // pv: item.pv || 0,
            })
          );

          setChartData(transformedData);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching summaries:", error);
      }
    };
    fetchSummaries();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      const userDocRef = doc(firestore, "Users", user.uid); // Replace with the actual user ID
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUsername(userDoc.data().username); // Adjust based on your Firestore document structure
      } else {
        console.log("No such document!");
      }
    };

    fetchUsername();
  }, []);
  return (
    <Container>
      <div style={{ margin: "150px 0" }}>
        <h1 claasName="header-font">
          Hi {username}, it’s great to see you again! What exciting content will
          we uncover today?
        </h1>
        <br />
        <div className="dashboard">
          <div className="dashboard-item">
            <h3 className="header-font">Syed Amanullah Wasti</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart width={500} height={300} data={data} barSize={20}>
                <XAxis
                  dataKey="name"
                  scale="point"
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar
                  dataKey="pv"
                  fill="#8884d8"
                  background={{ fill: "#eee" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="dashboard-item">
            <h3 className="header-font">Syed Amanullah Wasti</h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pv"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="dashboard-item">
            <h3 className="header-font">Syed Amanullah Wasti</h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pv"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="work">
          <Link to="/work" className="work-button">
            Let's Get Cooking
          </Link>
        </div>
      </div>
    </Container>
  );
}
