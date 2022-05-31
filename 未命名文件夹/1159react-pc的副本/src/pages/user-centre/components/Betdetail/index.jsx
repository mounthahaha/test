import React, { useState, useEffect } from "react";
import { Button, Carousel } from "antd";
import API from "@/api/account.api";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper";
// Import Swiper styles
import "swiper/css";

import backPng from "@/assets/common/back.png";
import styles from "./styles.module.scss";
import vip1Png from "@/assets/userCenter/level/vip-1_2.png";
import vip2Png from "@/assets/userCenter/level/vip-2_2.png";
import vip3Png from "@/assets/userCenter/level/vip-3_2.png";
import vip4Png from "@/assets/userCenter/level/vip-4_2.png";
import vip5Png from "@/assets/userCenter/level/vip-5_2.png";
import vip6Png from "@/assets/userCenter/level/vip-6_2.png";
import vip7Png from "@/assets/userCenter/level/vip-7_2.png";
import vip8Png from "@/assets/userCenter/level/vip-8_2.png";
import vip9Png from "@/assets/userCenter/level/vip-9_2.png";
import vip10Png from "@/assets/userCenter/level/vip-10_2.png";
const Vip = () => {
  useEffect(async () => {}, []);
  function onChange(a, b, c) {
    console.log(a, b, c);
  }

  const vipItemData = [
    {
      level: "VIP1",
      deposit: "≥1000",
      effective: "≥3000",
      grade: "≥2000",
      vipImg: vip1Png,
    },
    {
      level: "VIP2",
      deposit: "≥1000",
      effective: "≥1万",
      grade: "≥2000",
      vipImg: vip2Png,
    },
    {
      level: "VIP3",
      deposit: "≥1万",
      effective: "≥5万",
      grade: "≥1.5万",
      vipImg: vip3Png,
    },
    {
      level: "VIP4",
      deposit: "≥5万",
      effective: "≥30万",
      grade: "≥5万",
      vipImg: vip4Png,
    },
    {
      level: "VIP5",
      deposit: "≥20万",
      effective: "≥120万",
      grade: "≥25万",
      vipImg: vip5Png,
    },
    {
      level: "VIP6",
      deposit: "≥50万",
      effective: "≥300万",
      grade: "≥60万",
      vipImg: vip6Png,
    },
    {
      level: "VIP7",
      deposit: "≥120万",
      effective: "≥720万",
      grade: "≥180万",
      vipImg: vip7Png,
    },
    {
      level: "VIP8",
      deposit: "≥300万",
      effective: "≥1800万",
      grade: "≥600万",
      vipImg: vip8Png,
    },
    {
      level: "VIP9",
      deposit: "≥1000万",
      effective: "≥6000万",
      grade: "≥2500万",
      vipImg: vip9Png,
    },
    {
      level: "VIP10",
      deposit: "≥3000万",
      effective: "≥1.8亿",
      grade: "",
      vipImg: vip10Png,
    },
  ];

  const contentStyle = {
    height: "160px",
    color: "#fff",
    lineHeight: "160px",
    textAlign: "center",
    background: "#364d79",
  };
  let SwiperSlides = (props) => (
    <div className={styles.swipItem}>
      <div className={styles.vip}>
        <div className={styles.vipLevel}>VIP{props.index}</div>
        <div className={styles.vipLevelImgV}>
          <img className={styles.vipLevelImg} src={vip1Png}></img>
        </div>
      </div>
      <div className={styles.conditionsNumV}>
        <div className={styles.conditionsItemV}>
          <div className={styles.conditionsNumber}>≥1000</div>
          <div className={styles.conditionsTitle}>累计存款</div>
        </div>
        <div className={styles.conditionsItemV}>
          <div className={styles.conditionsNumber}>≥3000</div>
          <div className={styles.conditionsTitle}>累计有效流水</div>
        </div>
        <div className={styles.conditionsItemV}>
          <div className={styles.conditionsNumber}>≥2000</div>
          <div className={styles.conditionsTitle}>保级有效流水</div>
        </div>
      </div>
    </div>
  );
  return (
    <div className={styles.vipDetailWarp}>详情 </div>
  );
};

export default Vip;
