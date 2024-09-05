import React from "react";
import Hero from "../components/Hero/Hero";
import { Container } from "@mui/material";
import FeatSlider from "../components/FeatSlider/FeatSlider";
import NewHero from "../components/NewHero/NewHero";
// import Signup from "../components/Signup/form";

export default function HomePage() {
  return (
    <Container>
      <NewHero />
      {/* <Hero /> */}
      <br />
      <br />
      <FeatSlider />
      <br />
      <br />
    </Container>
  );
}
