package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type HealthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Message string `json:"message"`
}

type StatusResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Redis   string `json:"redis"`
	Backend string `json:"backend"`
}

type AnalysisRequest struct {
	Metrics []interface{} `json:"metrics"`
}

type AnalysisResponse struct {
	ID                string  `json:"id"`
	Status            string  `json:"status"`
	Message           string  `json:"message"`
	AnomaliesDetected int     `json:"anomalies_detected"`
	Confidence        float64 `json:"confidence"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := HealthResponse{
		Status:  "ok",
		Service: "pulseapi-ai-service",
		Message: "AI service is running",
	}
	json.NewEncoder(w).Encode(response)
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := StatusResponse{
		Status:  "ok",
		Service: "pulseapi-ai-service",
		Redis:   "connected",
		Backend: "connected",
	}
	json.NewEncoder(w).Encode(response)
}

func analyzeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response := AnalysisResponse{
		ID:                "analysis-123",
		Status:            "completed",
		Message:           "Analysis completed",
		AnomaliesDetected: 0,
		Confidence:        0.85,
	}
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/status", statusHandler)
	http.HandleFunc("/api/analyze", analyzeHandler)

	fmt.Println("AI Service starting on port 8001...")
	if err := http.ListenAndServe(":8001", nil); err != nil {
		fmt.Printf("Server error: %v\n", err)
	}
}
