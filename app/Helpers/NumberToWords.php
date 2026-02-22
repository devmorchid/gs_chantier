<?php

namespace App\Helpers;

class NumberToWords
{
    private static $units = [
        '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
        'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
    ];

    private static $tens = [
        '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'
    ];

    /**
     * Convertir un nombre en lettres (français)
     */
    public static function convert(float $number): string
    {
        if ($number == 0) {
            return 'zéro';
        }

        $number = round($number, 2);
        $integerPart = (int) floor($number);
        $decimalPart = (int) round(($number - $integerPart) * 100);

        $result = self::convertInteger($integerPart);

        if ($decimalPart > 0) {
            $result .= ' et ' . self::convertInteger($decimalPart) . ' centimes';
        }

        return ucfirst($result);
    }

    /**
     * Convertir la partie entière
     */
    private static function convertInteger(int $number): string
    {
        if ($number < 0) {
            return 'moins ' . self::convertInteger(abs($number));
        }

        if ($number < 20) {
            return self::$units[$number];
        }

        if ($number < 100) {
            return self::convertTens($number);
        }

        if ($number < 1000) {
            return self::convertHundreds($number);
        }

        if ($number < 1000000) {
            return self::convertThousands($number);
        }

        if ($number < 1000000000) {
            return self::convertMillions($number);
        }

        return self::convertBillions($number);
    }

    /**
     * Convertir les dizaines (20-99)
     */
    private static function convertTens(int $number): string
    {
        $ten = (int) ($number / 10);
        $unit = $number % 10;

        // Cas spéciaux pour 70-79 et 90-99
        if ($ten == 7 || $ten == 9) {
            $unit = $number % 20;
            if ($unit < 10) {
                $unit += 10;
            }
        }

        $result = self::$tens[$ten];

        if ($unit > 0) {
            if ($ten == 8 && $unit > 0) {
                // quatre-vingts devient quatre-vingt
                $result = 'quatre-vingt';
            }
            
            if ($unit == 1 && $ten != 8 && $ten != 7 && $ten != 9) {
                $result .= ' et un';
            } elseif ($unit == 11 && ($ten == 7 || $ten == 9)) {
                $result .= '-onze';
            } else {
                $result .= '-' . self::$units[$unit];
            }
        } elseif ($ten == 8) {
            $result .= 's'; // quatre-vingts
        }

        return $result;
    }

    /**
     * Convertir les centaines (100-999)
     */
    private static function convertHundreds(int $number): string
    {
        $hundred = (int) ($number / 100);
        $remainder = $number % 100;

        $result = '';
        if ($hundred == 1) {
            $result = 'cent';
        } else {
            $result = self::$units[$hundred] . ' cent';
        }

        if ($remainder > 0) {
            $result .= ' ' . self::convertInteger($remainder);
        } elseif ($hundred > 1) {
            $result .= 's'; // cents au pluriel
        }

        return $result;
    }

    /**
     * Convertir les milliers (1000-999999)
     */
    private static function convertThousands(int $number): string
    {
        $thousand = (int) ($number / 1000);
        $remainder = $number % 1000;

        $result = '';
        if ($thousand == 1) {
            $result = 'mille';
        } else {
            $result = self::convertInteger($thousand) . ' mille';
        }

        if ($remainder > 0) {
            $result .= ' ' . self::convertInteger($remainder);
        }

        return $result;
    }

    /**
     * Convertir les millions
     */
    private static function convertMillions(int $number): string
    {
        $million = (int) ($number / 1000000);
        $remainder = $number % 1000000;

        $result = self::convertInteger($million) . ' million';
        if ($million > 1) {
            $result .= 's';
        }

        if ($remainder > 0) {
            $result .= ' ' . self::convertInteger($remainder);
        }

        return $result;
    }

    /**
     * Convertir les milliards
     */
    private static function convertBillions(int $number): string
    {
        $billion = (int) ($number / 1000000000);
        $remainder = $number % 1000000000;

        $result = self::convertInteger($billion) . ' milliard';
        if ($billion > 1) {
            $result .= 's';
        }

        if ($remainder > 0) {
            $result .= ' ' . self::convertInteger($remainder);
        }

        return $result;
    }
}
