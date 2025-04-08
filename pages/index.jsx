import React, { useState, useEffect } from "react";
import { Storage } from "@capacitor/storage";
import axios from "axios";
import { useTimer } from "../apiconstant/useTimer";
// import login from "../apiconstant/login";
import {
  BASE_URL,
  OTP_GENERATE_END_POINT,
  API_SUCCESS_CODE,
  OTP_VERIFY_ENDPOINT,
} from "../apiconstant/apiconstant";
import { useRouter } from "next/router";
import Image from "next/image";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from '../assets/new_logo_light.png.png';
// import "../styles/login.css"; // Ensure it's not a CSS module if using classNames directly

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { time, isTimeUp, resetTimer } = useTimer(30);
  const router = useRouter();


  const loadAuthToken = () => {
    const token = localStorage.getItem("token");
    const supplierJobProfile = localStorage.getItem("supplierJobProfile");

    if (token) {
      console.log("Token found:", supplierJobProfile);
      setIsUserLoggedIn(true);

      if (supplierJobProfile && supplierJobProfile !== null ) {
        router.push("/home");
      } else {
        router.push("/Profile");
      }
    } else {
      console.log("No token found. User is logged out.");
    }
  };

  useEffect(() => {


    loadAuthToken();
  }, []);



  const saveAuthToken = async (token) => {
    await Storage.set({
      key: "authToken",
      value: token,
    });
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setMobileNumber(value);
      setError(value.length === 10 ? "" : "Please enter a valid mobile number");
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const sendOtp = async () => {
    if (!mobileNumber) {
      setError("Mobile number is required.");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}${OTP_GENERATE_END_POINT}`,
        { phone: mobileNumber, role: "customer" },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === API_SUCCESS_CODE) {
        setIsOtpSent(true);
        setError("");
        resetTimer();
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch {
      setError("Error sending OTP. Please try again.");
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}${OTP_VERIFY_ENDPOINT}`,
        { phone: mobileNumber, role: "customer", otp },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status === API_SUCCESS_CODE) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("mobileNumber", mobileNumber);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("supplierID", response.data.data._id);
        const supplierIsPersonalStatus = localStorage.getItem("supplierIsPersonalStatus");
        const supplierJobProfile = localStorage.getItem("supplierJobProfile");
        await saveAuthToken(response.data.token);
        await Storage.set({
          key: 'supplierJobProfile',
          value: response.data.data.job_profile, // The token received from your backend
        });
     
        // if (supplierIsPersonalStatus == 1) {
        if (supplierJobProfile != null) {
          console.log("logged in false")
          router.push("/home");
        } else {
          router.push("/Profile");
          console.log("logged in true")
        }
        setError("");
        setOtpError("");
        setIsOtpSent(false);
        setIsUserLoggedIn(true);
        setIsModalOpen(true);
        setOtp("");
        setMobileNumber("");

      } else {
        setOtpError("Invalid OTP. Please try again.");
        setOtp("");
      }

    } catch {
      setOtpError("Error verifying OTP. Please try again.");
    }
  };

  const resendOtp = async () => {
    setOtp("");
    setIsOtpSent(true);
    setOtpError("");
    await sendOtp();
  };



  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
        <Image
                  src={logo}
                  alt="logo"
                  width={60}
                  height={60}
                
              />
          <h2>Login to Hora!</h2>
        </div>
        <div className="otp-login">
          {!isOtpSent ? (
            <div className="input-group login">
              <div style={{ width: "100%", display: "flex" }}>
                <div className="country-code">+91</div>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={handleMobileNumberChange}
                  placeholder="Login 10 digit Mobile Number"
                />
              </div>
            </div>
          ) : (
            <div className="input-group">
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter OTP"
                className="enterotp-input"
              />
            </div>
          )}

          <div className="buttons">
            {!isOtpSent ? (
              <button onClick={sendOtp} className="loginbtn">
                GET OTP
              </button>
            ) : (
              <button
                onClick={verifyOtp}
                className="loginbtn"
                disabled={otp.length !== 4}
              >
                Verify OTP
              </button>
            )}
          </div>

          {otpError ? (
            <div className="d-flex justify-content-between mt-2 otp-error">
              <p className="m-0 p-0 text-danger">* {otpError}</p>
              <p
                className="m-0 p-0"
                style={{ color: "#9252AA", cursor: "pointer" }}
                onClick={resendOtp}
              >
                Resend Code
              </p>
            </div>
          ) : isOtpSent ? (
            <div className="d-flex justify-content-center mt-4 resend-timer">
              <p className="m-0 p-0 text-center" style={{ color: "#8A8A8A" }}>
                Resend Code in {time} sec
              </p>
            </div>
          ) : null}

          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
