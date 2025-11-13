package main

import (
    "net/http"
    "net/http/httptest"
    "testing"
)

func TestHealthHandler(t *testing.T) {
    req := httptest.NewRequest(http.MethodGet, "/health", nil)
    w := httptest.NewRecorder()
    healthHandler(w, req)

    if w.Code != http.StatusOK {
        t.Fatalf("expected status 200, got %d", w.Code)
    }
    body := w.Body.String()
    if len(body) == 0 || !contains(body, "\"status\":\"ok\"") {
        t.Fatalf("unexpected body: %s", body)
    }
}

func TestStatusHandler(t *testing.T) {
    req := httptest.NewRequest(http.MethodGet, "/status", nil)
    w := httptest.NewRecorder()
    statusHandler(w, req)

    if w.Code != http.StatusOK {
        t.Fatalf("expected status 200, got %d", w.Code)
    }
    body := w.Body.String()
    if !contains(body, "\"redis\":\"connected\"") || !contains(body, "\"backend\":\"connected\"") {
        t.Fatalf("unexpected body: %s", body)
    }
}

func TestAnalyzeHandler_MethodNotAllowed(t *testing.T) {
    req := httptest.NewRequest(http.MethodGet, "/api/analyze", nil)
    w := httptest.NewRecorder()
    analyzeHandler(w, req)
    if w.Code != http.StatusMethodNotAllowed {
        t.Fatalf("expected status 405, got %d", w.Code)
    }
}

// minimal helper without pulling in extra deps
func contains(s, substr string) bool {
    return len(s) >= len(substr) && (func() bool { return indexOf(s, substr) >= 0 })()
}

func indexOf(s, substr string) int {
    for i := 0; i+len(substr) <= len(s); i++ {
        if s[i:i+len(substr)] == substr {
            return i
        }
    }
    return -1
}
