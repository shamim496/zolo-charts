<?php

namespace ZoloLibrary\Includes;

use ZoloLibrary\Includes\SingletonTrait;
use Zolo\Helpers\ZoloHelpers;

if (!defined('ABSPATH')) {
    exit;
}

if (!class_exists('ZoloLibrary\Includes\StyleGenerator')) {

    class StyleGenerator {
        use SingletonTrait;

        private $dynamic_styles = '';

        public function __construct() {
            // Ensure blocks in post content are rendered
            add_filter('the_content', 'do_blocks', 9);

            // Generate Style on block render
            add_filter('render_block', [$this, 'generate_style_on_render_block'], 10, 2);

            // Enqueue Dynamic Styles
            if (wp_is_block_theme()) {
                add_action('wp_head', [$this, 'output_dynamic_styles']);
            } else {
                add_action('wp_footer', [$this, 'output_dynamic_styles']);
            }
        }

        public function generate_style_on_render_block($block_content, $block) {
            if (isset($block['blockName']) && str_contains($block['blockName'], 'zolo/')) {
                // echo '<pre>';
                // print_r($block);
                // echo '</pre>';
                // die;
                do_action('zolo_block_render_block', $block);
                if (isset($block['attrs']['zoloStyles'])) {
                    $style = $this->zolo_generate_style($block['attrs']['zoloStyles']);
                    $this->dynamic_styles .= $style;
                }
            }

            return $block_content;
        }

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

        public function output_dynamic_styles() {
            if (!empty($this->dynamic_styles)) {
                echo '<style id="zolo-block-inline-styles">' . $this->dynamic_styles . '</style>'; // phpcs:ignore
            }
        }
    }
}

new StyleGenerator();
