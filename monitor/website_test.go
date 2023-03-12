package monitor

import (
	"fmt"
	"net/http"
	"os"
	"testing"
)

func TestWebsite(t *testing.T) {
	host := os.Getenv("SITE_HOST")
	if len(host) == 0 {
		fmt.Println("host was empty")
	}

	fmt.Println("Checking host", host)

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
