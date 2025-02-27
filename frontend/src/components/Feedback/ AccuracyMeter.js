.accuracy-meter {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 10px;
}

.meter-container {
  position: relative;
  width: 200px;
  height: 100px;
  margin-bottom: 15px;
}

.meter-scale {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}

.meter-label {
  position: absolute;
  bottom: 0;
  font-size: 12px;
  color: #777;
}

.meter-label.low {
  left: 0;
}

.meter-label.medium {
  left: 50%;
  transform: translateX(-50%);
}

.meter-label.high {
  right: 0;
}

.meter-dial {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 100px;
  height: 100px;
  border-radius: 100px 100px 0 0;
  background-color: #e0e0e0;
  overflow: hidden;
  transform: translateX(-50%);
}

.meter-value {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 5px;
  height: 50px;
  background-color: #4CAF50;
  transform-origin: bottom center;
  transform: translateX(-50%) rotate(0deg);
  transition: transform 0.5s ease-out;
}

.accuracy-value {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  font-weight: 600;
  color: #4CAF50;
}

.accuracy-label {
  font-size: 18px;
  font-weight: 500;
  color: #555;
}