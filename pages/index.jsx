import React, { useState, useEffect, useRef } from "react";
import {
  BASE_URL,
  OTP_GENERATE_END_POINT,
  API_SUCCESS_CODE,
  OTP_VERIFY_ENDPOINT,
} from "../apiconstant/apiconstant";
import axios from "axios";
import { Col, Form, Row } from "react-bootstrap";
import { useTimer } from "../apiconstant/useTimer";
import Popup from "../apiconstant/popup";
import loginImage from "../assets/login.png";
import orderWarning from "../assets/OrderWarning.png";
import { useRouter } from "next/router";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Home.module.css";

import logo from "../assets/new_logo_light.png.png";
import Image from "next/image";

const Login = () => {
  const [isWarningVisibleForTotalAmount, setWarningVisibleForTotalAmount] =
    useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [validOtp, setValidOtp] = useState(undefined);
  const [fetchedOtp, setFetchedOtp] = useState(null);
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [loginMsg, setLoginMsg] = useState("");
  const router = useRouter();
  const [validMobileNumber, setValidMobileNumber] = useState(false);
  const otpRefs = useRef([
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef(),
  ]);
  const { time, isTimeUp, resetTimer } = useTimer(25);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({});
  console.log(router);
  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");
    localStorage.clear();
    setPopupMessage({
      img: logoutImage,
      title: "Logout Successful",
      body: "You have been logged out successfully.",
      button: "OK",
    });
    setShowPopup(true);
    router.push("/");
  };

  const handleWarningClose = () => {
    setWarningVisibleForTotalAmount(false);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleOtpSuccess = () => {
    setPopupMessage({
      img: logoutImage,
      title: "Logout Successful",
      body: "You have been logged out successfully.",
      button: "OK",
    });
    setShowPopup(true);
  };

  const handleOrderWarning = () => {
    setPopupMessage({
      img: orderWarning,
      title: "Total Order Amount is less than ₹700",
      body: "Total Order amount can not be less than ₹700, Add more to continue",
      button: "Add More",
    });
    setWarningVisibleForTotalAmount(true);
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value.trim();
    setMobileNumber(value);

    const isValidPhoneNumber = /^\d{10}$/.test(value);
    if (!isValidPhoneNumber) {
      setPhoneNumberError("Please enter a valid 10-digit phone number.");
      setValidMobileNumber(false);
      setLoginError(true);
    } else {
      setPhoneNumberError("");
      setLoginError(false);
      setValidMobileNumber(true);
    }
  };

  useEffect(() => {
    if (isTimeUp && otpSent) {
      setOtpError(true);
    }
  }, [isTimeUp, otpSent]);

  useEffect(() => {
    if (otpSent) {
      otpRefs.current[0]?.current?.focus();
    }
  }, [otpSent]);

  const handleSendOtp = () => {
    fetchOtp();
  };

  useEffect(() => {
    console.log("Popup message changed:", popupMessage);
    console.log("Show popup state changed:", showPopup);
  }, [popupMessage, showPopup]);

  const handleOtpSuccess1 = () => {
    setPopupMessage({
      img: loginImage,
      title: "Login Successful",
      body: "You have been logged IN successfully.",
      button: "OK",
    });
    setShowPopup(true);
  };

  const validateOtp = async (enteredOtp) => {
    try {
      if (enteredOtp === fetchedOtp.toString()) {
        const url = BASE_URL + OTP_VERIFY_ENDPOINT;
        const requestData = {
          phone: mobileNumber,
          role: "supplier",
          otp: enteredOtp,
        };
        console.log(requestData, "requestData");
        const response = await axios.post(url, requestData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        console.log(response, "response verify ");
  
        // Check if there's an error and handle the specific error
        if (response.data.error && response.data.message === "The number is used already for Customer login . Please use different number") {
          alert("This phone number is already used for customer login. Please use a different number.");
          setOtpError("Phone number already in use. Please use a different number.");
          setLoginError(true);
        } else if (response.data.status === API_SUCCESS_CODE) {
          // Proceed with successful OTP verification
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("mobileNumber", mobileNumber);
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("supplierID", response.data.data._id);
  
  
          const hasLoggedInBefore = localStorage.getItem("hasLoggedInBefore");
  
          if (!hasLoggedInBefore) {
            localStorage.setItem("hasLoggedInBefore", "true");
            router.push("/Profile");
          } else {
            router.push("/Profile");
          }
  
          handleOtpSuccess1();
        } else {
          router.push("/Profile");
        }
      } else {
        setLoginMsg("");
        setValidOtp(false);
        setOtpError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      setLoginMsg(" ");
      setLoginError(true);
      console.log("Error verifying OTP:", error.message);
      setOtpError("Failed to verify OTP. Please try again.");
    }
  };
  

  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1].current.focus();
    }

    if (!value && index > 0) {
      otpRefs.current[index - 1].current.focus();
    }

    if (index === 3) {
      const enteredOtp = updatedOtp.join("");
      if (enteredOtp.length === 4) {
        validateOtp(enteredOtp);
      }
    }

    if (otpError) {
      setOtpError("");
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].current.focus();
    }
  };

  const fetchOtp = async () => {
    try {
      const url = BASE_URL + OTP_GENERATE_END_POINT;
      const requestData = {
        phone: mobileNumber,
        role: "supplier",
      };
      console.log(requestData, "requestData1234");
      const response = await axios.post(url, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.status === API_SUCCESS_CODE) {
        setFetchedOtp(response.data.otp);
        setOtpSent(true);
        resetTimer();
        setOtp(["", "", "", ""]);
        setOtpError("");
        console.log("OTP sent successfully");
      } else {
        console.log("OTP sending failed");
      }
    } catch (error) {
      console.log("Error sending OTP:", error.message);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        margin: "50px 0 0",
        marginTop: "200px",
      }}
    >
      <Image
        src={logo}
        alt="Icon"
        style={{
          width: "100px",
          height: "100px",
          alignSelf: "center",
          marginBottom: "30px",
        }}
      />
      {!loggedIn ? (
        <form
          className="loginform"
          style={!otpSent ? { maxWidth: "36rem" } : { maxWidth: "30rem" }}
        >
          {!otpSent ? (
            <>
              <div
                className="form-group"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  textAlign: "center",
                }}
              >
                <p
                  className="font-16px"
                  style={{ color: "#9252AA", fontWeight: 600 }}
                >
                  Login with your mobile number{" "}
                </p>
                <div className="row gap-1 justify-content-center">
                  <div className="col-2 p-0 text-center phone-code-wrapper">
                    <p className="form-control rounded-2 phone-code m-0 py-3">
                      +91
                    </p>
                  </div>
                  <div className="col-8 p-0">
                    <Form.Control
                      className={`rounded-2 font-20px px-4 py-3 mb-4 ${
                        loginError ? "otp-failed" : "input-field"
                      }`}
                      type="tel"
                      name="mobileNumber"
                      onChange={handleMobileNumberChange}
                      value={mobileNumber}
                      placeholder="Enter your 10 digit mobile number"
                      isInvalid={loginError}
                    />
                  </div>
                </div>
                {phoneNumberError && (
                  <span className="error">{phoneNumberError}</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!validMobileNumber}
                className="blue-btn loginbtn"
              >
                GET OTP
              </button>
            </>
          ) : (
            <>
              <p className="font-14px text-center">
                Check your phone we have sent you an OTP to{" "}
                <span className="font-14px phone-number-span">
                  (+91) {mobileNumber}
                </span>{" "}
              </p>
              <Row className="justify-content-center">
                {otp.map((digit, index) => (
                  <Col key={index} xs={3} style={{ maxWidth: "7rem" }}>
                    <Form.Control
                      type="text"
                      className={`rounded-3 input-field font-20px py-3 text-center ${
                        otpError ? "otp-failed" : ""
                      }`}
                      name={`otp[${index}]`}
                      maxLength={1}
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      ref={otpRefs.current[index]}
                    />
                  </Col>
                ))}
              </Row>
            </>
          )}
          {loginMsg && <span className="successmsg">{loginMsg} </span>}
          {otpError && <span className="error">{otpError}</span>}
          {otpError ? (
            <div className="d-flex justify-content-between mt-4">
              <p className="m-0 p-0 text-danger font-13px">*Wrong OTP</p>
              <p
                className="m-0 p-0 font-13px"
                style={{ color: "#9252AA", cursor: "pointer" }}
                onClick={fetchOtp}
              >
                Resend Code
              </p>
            </div>
          ) : (
            otpSent && (
              <div className="d-flex justify-content-center mt-4">
                <p
                  className="m-0 p-0 font-13px text-center"
                  style={{ color: "#8A8A8A" }}
                >
                  Resend Code in {time} sec
                </p>
              </div>
            )
          )}
        </form>
      ) : (
        <div>
          <p>Welcome! You have successfully logged in.</p>
        </div>
      )}
      {showPopup && (
        <Popup
          onClose={() => setShowPopup(false)}
          popupMessage={popupMessage}
        />
      )}
    </div>
  );
};

export default Login;
