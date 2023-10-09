import React, { useContext, useEffect, useRef, useState } from "react";
import { useAnimate, motion } from "framer-motion";
import styled from "styled-components";
import { ArrowSpinnerButtonInterface } from "../interfaces/arrowSpinButton.interface";
import { PinInterface } from "../interfaces/pin.interface";
import { WheelInterface } from "../interfaces/wheel.interface";
import { ExtendedWheelSegmentInterface } from "../interfaces/extendedWheelSegment.interface";

type Props = {
  wheel: WheelInterface
  arrowSpinnerBtn:ArrowSpinnerButtonInterface
  pin: PinInterface
};

const ArrowSpinnerBtn = styled.div<{$arrowSpinnerBtn: ArrowSpinnerButtonInterface}>`
&:after {
  content: "";
  position: absolute;
  top: -28px;
  width: 20px;
  height: 30px;
  background-color: ${props => props.$arrowSpinnerBtn.backgroundColor};
  clip-path: polygon(50% 0%, 15% 100%, 85% 100%);
}
`;

const Pin = styled.div<{$pin: PinInterface}>`
&:after {
  content: "";
  position: absolute;
  top: -28px;
  width: 20px;
  height: 40px;
  background-color: ${props=> props.$pin.backgroundColor};
  clip-path: polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%);
}
`;

const Wheel = ({ wheel, arrowSpinnerBtn, pin }: Props) => {
  const startingRotation = 45; //base starting position. This is to start in the middle 90deg
  const initialRotationValue = (360*wheel.rotations)+startingRotation;
  const [rotationValue, setRotationValue] = useState<number>(initialRotationValue);
  const [segments, setSegments] = useState<ExtendedWheelSegmentInterface[]>([]);
  const [spun, setSpun] = useState(false);
  const [winningSegment, setWinningSegment] = useState<ExtendedWheelSegmentInterface| undefined>(undefined);
  const [isWheelDisabled, setIsWheelDisabled] = useState(wheel.disabled);
  const [started, setStarted] = useState(false);
  const [reset, setReset] = useState(false);


  if (wheel.segments.length < 4) {
    throw new Error("Only allowing more than 4 segments");
  }

  if (wheel.segments.length > 20) {
    throw new Error("Only allowing less than 21 segments");
  }

  if (wheel.segments.length % 4 !== 0) {
    throw new Error("The amount of items should be divisible by 4");
  }

  const clipPathValues: Record<number, number> = {
    4: 100,
    // 5: 90,
    6: 80,
    // 7: 65,
    8: 60,
    // 9: 55,
    10: 50,
    // 11: 45,
    12: 42,
    // 13: 40,
    14: 37,
    // 15: 35,
    16: 33,
    // 17: 31,
    // 18: 30,
    // 19: 28,
    20: 27,
  };

  useEffect(() => {
    
  setSegments(() =>{
    let previousRotation = 45;
    let nextRotation;

    return wheel.segments.map((segment, index) => {
      // Calculate the rotation for each segment based on the total number of segments
      const rotation = 360 / wheel.segments.length;
  
      // Calculate clipPath based on the number of segments
      const clipPathValue = clipPathValues[wheel.segments.length];
  
      // Use the calculated rotation for the transform
      const segmentRotation = rotation * (index + 0.5);
  
          // Calculate the starting and ending degree values for the degreeSpan
          nextRotation = 45 - (rotation * (index + 1));
          const startDegree = nextRotation;
          const endDegree = previousRotation;
          previousRotation = nextRotation;
  
      return {segmentRotation, degreeSpan:[startDegree,endDegree], clipPathValue, ...segment, rotation}})
  }
    )
  
  }, [])

  useEffect(() => {
    
  if(spun){
    setTimeout(()=>{
      setIsWheelDisabled(true);
    },wheel.rotations*1000)
  }
   
  }, [spun])

  useEffect(() => {
 if(started) if (isWheelDisabled){console.warn('Wheel Is Disabled')}else{spin()};
  }, [started])
  
  

  const spin = () => {
    setRotationValue((previousRotationValue) => {
      const max = 45;
      const min = -315;

       const rotationValue = Math.random() * (max - min) + min;

      console.log("Rotate Degrees: ", rotationValue); 
      setWinningSegment(segments.find(segment => {
        if (segment.degreeSpan[0] < rotationValue && rotationValue < segment.degreeSpan[1]){
return true;
        }
      }));

      return rotationValue;
    });
    setSpun(true);
  };

  return (
    <section
      className="wheel-container"
      style={{
        position: "relative",
        width: `${wheel.width}px`,
        height: `${wheel.height}px`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {arrowSpinnerBtn.show ? (
        <ArrowSpinnerBtn
          className="arrowSpinnerBtn"
          style={{
            position: "absolute",
            width: `${arrowSpinnerBtn.width}px`,
            height: `${arrowSpinnerBtn.height}px`,
            background: `${arrowSpinnerBtn.backgroundColor}`,
            borderRadius: "50%",
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textTransform: "uppercase",
            fontWeight: 600,
            color: "#333",
            letterSpacing: "0.1em",
            border: `${arrowSpinnerBtn.borderWidth}px solid ${arrowSpinnerBtn.borderColor}`,
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={spin}
          $arrowSpinnerBtn={arrowSpinnerBtn}
        >
          {arrowSpinnerBtn.text}
        </ArrowSpinnerBtn>
      ) : (
        <div
          className="arrowSpinnerBtn"
          style={{
            position: "absolute",
            width: `${arrowSpinnerBtn.width / 5}px`,
            height: `${arrowSpinnerBtn.height / 5}px`,
            background: `${arrowSpinnerBtn.backgroundColor}`,
            borderRadius: "50%",
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
          }}
        ></div>
      )}

      {pin.show && (
        <Pin
          className="pin"
          style={{
            position: "absolute",
            background: `${pin.backgroundColor}`,
            top: 12,
            zIndex: 10,
            display: "flex",
            justifyContent: "space-evenly",
          }}
          $pin={pin}
        />
      )}
      <motion.div
        className="wheel"
        initial={{ rotate: initialRotationValue }}
        animate={{
          rotate: rotationValue ,
          transition: { duration: 0 },
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: wheel.backgroundColor,
          borderRadius: "50%",
          overflow: "hidden",
          boxShadow: `0 0 0 5px ${wheel.backgroundColor}, 0 0 0 15px #fff, 0 0 0 18px #111`,
          transition: `transform 5s ${wheel.timingFunction}`,
        }}
   
      >
        {segments.map((segment, index:number) => {
          const {segmentRotation, clipPathValue, rotation, name, color} = segment;

          return (
            <div
              key={index + name}
              style={{
                position: "absolute",
                width: "50%",
                height: "50%",
                background: color,
                transformOrigin: "bottom right",
                transform: `rotate(${segmentRotation}deg)`,
                // Use the calculated clipPathValue for the clipPath
                clipPath: `polygon(0 0, ${clipPathValue}% 0, 100% 100%, 0 ${clipPathValue}%)`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                userSelect: "none",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  position: "relative",
                  // Rotate the text back so it's horizontal
                  transform: `rotate(45deg)`,
                  fontSize: "1em",
                  fontWeight: 700,
                  color: "white",
                  textShadow: "3px 5px 2px rgba(0,0,0,0.15)",
                }}
              >
                {rotation * (index + 1)}deg
              </span>
            </div>
          );
        })}
      </motion.div>
    {isWheelDisabled &&   <div className="overlay"  style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: 'rgb(0 0 0 / 65%)',
          borderRadius: "50%",
          overflow: "hidden",
       zIndex:10,cursor: "not-allowed"
        }}/>}
    </section>
  );
};

export default Wheel;
