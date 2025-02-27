.free-training {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.training-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

@media (min-width: 768px) {
  .training-container {
    flex-direction: row;
  }
}

.webcam-container {
  position: relative;
  flex: 1;
  min-height: 400px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #000;
}

.webcam {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  padding: 20px;
}

.pose-info-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
  color: white;
}

.training-time {
  font-size: 24px;
  font-weight: 600;
  margin-top: 5px;
}

.pose-feedback {
  flex: 0 0 300px;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.btn-primary, .btn-stop, .btn-secondary {
  padding: 12px 24px;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  min-width: 200px;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #3e8e41;
}

.btn-stop {
  background-color: #f44336;
  color: white;
}

.btn-stop:hover {
  background-color: #d32f2f;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.pose-selection {
  width: 100%;
  margin-top: 20px;
}

.pose-selection h3 {
  text-align: center;
  margin-bottom: 20px;
}

.pose-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.pose-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pose-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.pose-image, .pose-image-placeholder {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.pose-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #999;
  font-size: 36px;
  font-weight: 600;
}

.pose-card-info {
  padding: 15px;
}

.pose-card-info h4 {
  margin: 0 0 5px 0;
}

.pose-card-info p {
  color: #666;
  margin: 0 0 10px 0;
  font-size: 14px;
}

.difficulty {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.beginner {
  background-color: #e8f5e9;
  color: #4CAF50;
}

.intermediate {
  background-color: #fff8e1;
  color: #FFC107;
}

.advanced {
  background-color: #ffebee;
  color: #F44336;
}