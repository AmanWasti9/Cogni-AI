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

  const auth = getAuth();
  const user = auth.currentUser;

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
