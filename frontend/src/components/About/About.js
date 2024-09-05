import { Grid2 } from "@mui/material";
import React from "react";

export default function About() {
  return (
    <div>
      <h1 className="text-center">About Us</h1>
      <Grid2
        container
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid2
          xs={12}
          md={6}
          sx={{
            height: "250px",
            width: "550px",
            border: "2px solid black",
          }}
        ></Grid2>
        <Grid2
          xs={12}
          md={6}
          sx={{
            height: "250px",
            width: "550px",
            border: "2px solid black",
          }}
        ></Grid2>
      </Grid2>
      <br />
      <Grid2
        container
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid2
          xs={12}
          md={12}
          sx={{
            height: "250px",
            width: "1100px",
            border: "2px solid black",
          }}
        ></Grid2>
      </Grid2>
    </div>
  );
}
