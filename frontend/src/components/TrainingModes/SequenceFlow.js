.sequence-flow {
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.sequence-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sequence-progress {
  background-color: #f0f0f0;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
}

.current-pose {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.pose-description {
  color: #666;
  margin-bottom: 15px;
}

.timer {
  margin-top: 15px;
}

.time-remaining {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 5px;
  transition: width 1s linear;
}

.pose-analysis {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.next-pose {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
}

.next-pose h4 {
  margin-top: 0;
  color: #555;
}

.transition-hint {
  font-style: italic;
  color: #777;
}

.btn-skip {
  background-color: transparent;
  border: 1px solid #ddd;
  color: #555;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  align-self: center;
  transition: all 0.2s;
}

.btn-skip:hover {
  background-color: #f5f5f5;
}

.sequence-summary {
  background-color: #fff;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 40px auto;
  text-align: center;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
  margin: 30px 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.value {
  font-size: 24px;
  font-weight: 600;
  color: #444;
}

.feedback-section {
  text-align: left;
  margin-bottom: 30px;
}

.feedback-section ul {
  padding-left: 20px;
}

.feedback-section li {
  margin-bottom: 8px;
  color: #555;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #3e8e41;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error {
  color: #e53935;
}