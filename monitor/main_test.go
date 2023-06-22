package main

import (
	"github.com/gocolly/colly"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
	"strings"
	"testing"
)

func TestSite(t *testing.T) {
	err := godotenv.Load()
	if err != nil {
		log.Fatalln("Error loading .env file")
	}

	host := os.Getenv("HOST")
	if len(host) == 0 {
		t.Errorf("DOMAIN environment variable not set")
	}

	split := strings.Split(host, "//")
	if len(split) != 2 {
		t.Errorf("DOMAIN environment variable is invalid")
	}

	domain := split[1]
	if domain[len(domain)-1] == '/' {
		domain = domain[:len(domain)-1]
	}

	t.Run("site is accessible", func(t *testing.T) {
		response, err := http.Get(host)
		if err != nil {
			t.Errorf("Error making request to %s: %s", host, err)
		}
		if response.StatusCode != http.StatusOK {
			t.Errorf("Expected status code %d, got %d", http.StatusOK, response.StatusCode)
		}
	})

	t.Run("least seven pages discoverable", func(t *testing.T) {
		expectedVisited := 7
		actualVisited := 0

		c := colly.NewCollector(colly.AllowedDomains(domain))

		c.OnHTML("a[href]", func(e *colly.HTMLElement) {
			e.Request.Visit(e.Attr("href"))
		})

		c.OnRequest(func(r *colly.Request) {
			log.Println("Found", r.URL)
			actualVisited++
		})

		err = c.Visit(host)
		if err != nil {
			log.Println(err)
		}

		log.Printf("Visited total of %d pages", actualVisited)

		if actualVisited < expectedVisited {
			t.Errorf("Expected at least %d pages to be actualVisited, got %d", expectedVisited, actualVisited)
		}
	})
}
