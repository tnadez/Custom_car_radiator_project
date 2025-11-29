const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

// ดึงราคาทองแดงจาก web scraping แหล่งข้อมูลสาธารณะ
router.get('/copper-price', async (req, res, next) => {
    try {
        // Scrape copper price from multiple sources with fallback
        let copperData = null;

        // Method 1: Try scraping from metals.com or similar public source
        try {
            const response = await axios.get('https://markets.businessinsider.com/commodities/copper-price', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 5000
            });

            const $ = cheerio.load(response.data);

            // Try to find price element (structure may vary)
            let priceText = $('.price-section__current-value').first().text().trim();

            if (!priceText) {
                // Try alternative selectors
                priceText = $('[data-field="Mid"]').first().text().trim() ||
                    $('.snapshot__data-item--last').first().text().trim() ||
                    $('.price').first().text().trim();
            }

            if (priceText) {
                // Clean and parse price
                const priceNum = parseFloat(priceText.replace(/[^0-9.]/g, ''));

                if (!isNaN(priceNum) && priceNum > 0) {
                    // Business Insider shows price per metric ton (1000 kg)
                    const pricePerKg = priceNum / 1000; // convert from per ton to per kg
                    const pricePerLb = pricePerKg / 2.20462; // convert to per pound

                    copperData = {
                        price: priceNum,
                        currency: 'USD',
                        unit: 'per_metric_ton',
                        timestamp: new Date().toISOString(),
                        pricePerKg: pricePerKg.toFixed(2),
                        pricePerLb: pricePerLb.toFixed(2),
                        pricePerTon: priceNum.toFixed(2),
                        source: 'scraped_businessinsider'
                    };
                }
            }
        } catch (scrapeError) {
            console.log('Business Insider scrape failed, trying alternative source:', scrapeError.message);
        }

        // Method 2: Try alternative source
        if (!copperData) {
            try {
                const response = await axios.get('https://www.investing.com/commodities/copper', {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 5000
                });

                const $ = cheerio.load(response.data);
                const priceText = $('[data-test="instrument-price-last"]').first().text().trim() ||
                    $('.instrument-price_last__KQzyA').first().text().trim();

                if (priceText) {
                    const priceNum = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                    if (!isNaN(priceNum) && priceNum > 0) {
                        copperData = {
                            price: priceNum,
                            currency: 'USD',
                            unit: 'per_pound',
                            timestamp: new Date().toISOString(),
                            pricePerKg: (priceNum * 2.20462).toFixed(2),
                            pricePerLb: priceNum.toFixed(2),
                            pricePerTon: (priceNum * 2204.62).toFixed(2),
                            source: 'scraped_investing'
                        };
                    }
                }
            } catch (altError) {
                console.log('Investing.com scrape failed:', altError.message);
            }
        }

        // Fallback: Use approximate market price if scraping fails
        if (!copperData) {
            console.log('All scraping attempts failed, using fallback price');
            copperData = {
                price: 4.15,
                currency: 'USD',
                unit: 'per_pound',
                timestamp: new Date().toISOString(),
                pricePerKg: 9.15,
                pricePerLb: 4.15,
                pricePerTon: 9150,
                source: 'fallback_estimate',
                note: 'ไม่สามารถดึงข้อมูลจากแหล่งออนไลน์ได้ ใช้ราคาโดยประมาณ'
            };
        }

        res.json({
            success: true,
            data: copperData
        });

    } catch (err) {
        next(err);
    }
});

// ดึงราคาอลูมิเนียมจาก web scraping
router.get('/aluminum-price', async (req, res, next) => {
    try {
        let aluminumData = null;

        // Method 1: Try Business Insider
        try {
            const response = await axios.get('https://markets.businessinsider.com/commodities/aluminum-price', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 5000
            });

            const $ = cheerio.load(response.data);
            let priceText = $('.price-section__current-value').first().text().trim();

            if (!priceText) {
                priceText = $('[data-field="Mid"]').first().text().trim() ||
                    $('.snapshot__data-item--last').first().text().trim() ||
                    $('.price').first().text().trim();
            }

            if (priceText) {
                const priceNum = parseFloat(priceText.replace(/[^0-9.]/g, ''));

                if (!isNaN(priceNum) && priceNum > 0) {
                    const pricePerKg = priceNum / 1000; // convert from per ton to per kg
                    const pricePerLb = pricePerKg / 2.20462;

                    aluminumData = {
                        price: priceNum,
                        currency: 'USD',
                        unit: 'per_metric_ton',
                        timestamp: new Date().toISOString(),
                        pricePerKg: pricePerKg.toFixed(2),
                        pricePerLb: pricePerLb.toFixed(2),
                        pricePerTon: priceNum.toFixed(2),
                        source: 'scraped_businessinsider'
                    };
                }
            }
        } catch (scrapeError) {
            console.log('Business Insider aluminum scrape failed:', scrapeError.message);
        }

        // Method 2: Try Investing.com
        if (!aluminumData) {
            try {
                const response = await axios.get('https://www.investing.com/commodities/aluminum', {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    timeout: 5000
                });

                const $ = cheerio.load(response.data);
                const priceText = $('[data-test="instrument-price-last"]').first().text().trim() ||
                    $('.instrument-price_last__KQzyA').first().text().trim();

                if (priceText) {
                    const priceNum = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                    if (!isNaN(priceNum) && priceNum > 0) {
                        aluminumData = {
                            price: priceNum,
                            currency: 'USD',
                            unit: 'per_pound',
                            timestamp: new Date().toISOString(),
                            pricePerKg: (priceNum * 2.20462).toFixed(2),
                            pricePerLb: priceNum.toFixed(2),
                            pricePerTon: (priceNum * 2204.62).toFixed(2),
                            source: 'scraped_investing'
                        };
                    }
                }
            } catch (altError) {
                console.log('Investing.com aluminum scrape failed:', altError.message);
            }
        }

        // Fallback: Use approximate market price
        if (!aluminumData) {
            console.log('All aluminum scraping attempts failed, using fallback price');
            aluminumData = {
                price: 2.30,
                currency: 'USD',
                unit: 'per_kg',
                timestamp: new Date().toISOString(),
                pricePerKg: 2.30,
                pricePerLb: 1.04,
                pricePerTon: 2300,
                source: 'fallback_estimate',
                note: 'ไม่สามารถดึงข้อมูลจากแหล่งออนไลน์ได้ ใช้ราคาโดยประมาณ'
            };
        }

        res.json({
            success: true,
            data: aluminumData
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
