<?php

/**
 * ZoloHelpers
 *
 * AJAX Event Handler
 *
 * @class    ZoloHelpers
 * @version  0.0.1
 * @package  zolo-helpers
 * @category Class
 */

namespace ZoloLibrary\Includes;

use mysql_xdevapi\Statement;
use ZoloLibrary\Includes\SingletonTrait;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Zolo helper main helper function
 */
class ZoloHelpers {
    use SingletonTrait;

    /**
     * Generate Style String
     */
    public static function zolo_generate_style($style) {
        $css = '';
        if (isset($style['desktop']) && strlen($style['desktop']) > 0) {
            $css .= $style['desktop'];
        }
        if (isset($style['tab']) && strlen($style['tab']) > 0) {
            $css .= sprintf(
                '@media all and (max-width: 1024px) {%1$s}',
                $style['tab']
            );
        }
        if (isset($style['mobile']) && strlen($style['mobile']) > 0) {
            $css .= sprintf(
                '@media all and (max-width: 767px) {%1$s}',
                $style['mobile']
            );
        }

        if (! empty($style['customCss']) && strlen($style['customCss']) > 0) {
            $css .= $style['customCss'];
        }

        return $css;
    }
}
