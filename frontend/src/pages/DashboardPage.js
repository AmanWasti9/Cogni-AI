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
  BarChart,
  Bar,
} from "recharts";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import { getAuth } from "firebase/auth";
import { format, subDays } from "date-fns";

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [chartData, setChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page
  }, []);

  useEffect(() => {
    // Fetch the username from Firestore
    const fetchUsername = async () => {
      if (user) {
        const userDocRef = doc(firestore, "Users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        } else {
          console.log("No such document!");
        }
      }
    };

    // Fetch summaries from Firestore and transform data
    const fetchSummaries = async () => {
      if (user) {
        try {
          const userDocRef = doc(firestore, "Summaries", user.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userSummaries = userDocSnapshot.data().Summaries || [];

            // Transform and filter data for the last seven days
            const lastSevenDays = [...Array(7)]
              .map((_, index) => {
                const date = format(subDays(new Date(), index), "yyyy-MM-dd");

                const postCount = userSummaries.filter((item) => {
                  // Ensure item.date exists and is a Firestore Timestamp object
                  if (item.date && typeof item.date.toDate === "function") {
                    const itemDate = item.date.toDate(); // Convert Firestore timestamp to Date object
                    const formattedItemDate = format(itemDate, "yyyy-MM-dd");
                    return formattedItemDate === date;
                  }
                  return false;
                }).length;

                return { date, postCount };
              })
              .reverse(); // Reverse to display from oldest to most recent

            setChartData(lastSevenDays);
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching summaries:", error);
        }
      }
    };

    const fetchTopThreeSummaries = async () => {
      try {
        // Replace 'user.uid' with the actual UID of the logged-in user if available
        const userDocRef = doc(firestore, "Summaries", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userSummaries = userDocSnapshot.data().Summaries || [];

          console.log("Fetched summaries:", userSummaries);
          const transformedData = userSummaries.map((item, index) => ({
            name: item.name || `Page ${index + 1}`,
            likesCount: item.likes ? item.likes.length : 0, // Use item.likes.length to count likes
          }));

          // Sort the data by likesCount in descending order and take the top 3
          const topThreeSummaries = transformedData
            .sort((a, b) => b.likesCount - a.likesCount)
            .slice(0, 3);

          setBarChartData(topThreeSummaries);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching summaries:", error);
      }
    };

    fetchTopThreeSummaries();

    fetchUsername();
    fetchSummaries();
  }, [user]);

  return (
    <Container>
      <div style={{ margin: "150px 0" }}>
        <h1 className="header-font">
          Hi {username}, it’s great to see you again! What exciting content will
          we uncover today?
        </h1>
        <br />
        <div className="dashboard">
          <div className="dashboard-item">
            <h3 className="header-font">Top 3 Liked Post</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                width={500}
                height={300}
                data={barChartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                barSize={20}
              >
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
                  dataKey="likesCount"
                  fill="#8884d8"
                  background={{ fill: "#eee" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="dashboard-item">
            <h3 className="header-font">Last 7 Days Post Counts</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="postCount" stroke="#5218fa" />
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
