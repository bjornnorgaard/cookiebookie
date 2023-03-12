package monitor

import (
	"fmt"
	"net/http"
	"os"
	"testing"
)

func TestWebsite(t *testing.T) {
	fmt.Println("starting test")
	host := os.Getenv("SITE_HOST")
	if len(host) == 0 {
		fmt.Println("host was empty")
		host = "http://localhost:5174"
	}

	fmt.Println("testing host", host)

	t.Run("should load main page", func(t *testing.T) {
		response, err := http.Get(host)
		if err != nil {
			fmt.Println("http error", err)
			t.Error(err)
		}
		if response.StatusCode != http.StatusOK {
			fmt.Println("non 200")
			t.Errorf("éxpected 200 received %d", response.StatusCode)
		}
		fmt.Println("done")
	})
}
