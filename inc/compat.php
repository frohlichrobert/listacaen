<?php
declare(strict_types=1);

// Înlocuitori pentru funcțiile mbstring, ca site-ul să meargă și pe servere
// fără extensia mbstring. Textul este UTF-8; folosim doar PCRE cu modificatorul /u.

if (!function_exists('mb_strlen')) {
    function mb_strlen(string $s, ?string $encoding = null): int
    {
        return (int) preg_match_all('/./us', $s);
    }
}

if (!function_exists('mb_substr')) {
    function mb_substr(string $s, int $start, ?int $length = null, ?string $encoding = null): string
    {
        $chars = preg_split('//u', $s, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        return implode('', array_slice($chars, $start, $length));
    }
}

if (!function_exists('mb_strrpos')) {
    function mb_strrpos(string $haystack, string $needle, int $offset = 0, ?string $encoding = null): int|false
    {
        $pos = strrpos($haystack, $needle);
        return $pos === false ? false : mb_strlen(substr($haystack, 0, $pos));
    }
}

if (!function_exists('mb_strtolower')) {
    function mb_strtolower(string $s, ?string $encoding = null): string
    {
        return strtolower(strtr($s, [
            'Ă' => 'ă', 'Â' => 'â', 'Î' => 'î', 'Ș' => 'ș', 'Ț' => 'ț', 'Ş' => 'ş', 'Ţ' => 'ţ',
        ]));
    }
}
