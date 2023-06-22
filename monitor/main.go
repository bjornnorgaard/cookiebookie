package main

import (
	"github.com/gocolly/colly"
	"github.com/joho/godotenv"
	"log"
	"os"
	"strings"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalln("Error loading .env file")
	}

	host := os.Getenv("HOST")
	if len(host) == 0 {
		log.Fatalln("HOST environment variable not set")
	}

	split := strings.Split(host, "//")
	if len(split) != 2 {
		log.Fatalln("HOST environment variable is invalid")
	}

	domain := split[1]

	c := colly.NewCollector(colly.AllowedDomains(domain))

	c.OnHTML("a[href]", func(e *colly.HTMLElement) {
		_ = e.Request.Visit(e.Attr("href"))
	})

	c.OnRequest(func(r *colly.Request) {
		log.Println("Visiting", r.URL)
	})

	err = c.Visit(host)
	if err != nil {
		log.Println(err)
	}
}
