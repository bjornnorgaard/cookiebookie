package monitor

import (
	"net/http"
	"os"
	"testing"
)

func TestWebsite(t *testing.T) {
	host := os.Getenv("SITE_HOST")
	if len(host) == 0 {
		host = "http://localhost:5174"
	}

	t.Run("should load main page", func(t *testing.T) {
		response, err := http.Get(host)
		if err != nil {
			t.Error(err)
		}
		if response.StatusCode != http.StatusOK {
			t.Errorf("éxpected 200 received %d", response.StatusCode)
		}
	})
}
