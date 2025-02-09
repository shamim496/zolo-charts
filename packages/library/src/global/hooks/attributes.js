/**
 * External Dependencies
 */
import classNames from 'classnames';

/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState, Fragment, useRef } from '@wordpress/element';
import { createHigherOrderComponent } from '@wordpress/compose';
import { select, useSelect, withSelect } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';
import { prefix } from '../constants';
import WebFont from 'webfontloader';

/**
 * Internal depencencies
 */
import {
    handleUniqueId,
    generateResAlignmentAttributies,
    generateResSelectAttributies,
    generateResRangeAttributies,
    generateBorderAttributies,
    generateDimensionAttributes,
    generateNormalBGAttributes,
    generateBoxShadowAttributies,
    generateTypographyAttributes,
    generateBackgroundAttributes,
} from '@zoloblocks/library'

/**
 * Internal Dependencies
 */

/**
 * Add custom attribute for Essential Block
 *
 * @param {Object} settings Settings for the block.
 *
 * @return {Object} settings Modified settings.
 */
function addAttributes(settings) {
    if (typeof settings.attributes === 'undefined') {
        return settings;
    }
    if (settings.category && settings.category == 'zoloblocks') {
        // if (settings.name === 'zolo/advanced-button') {
        // }
        settings.attributes = {
            ...settings.attributes,
            uniqueId: {
                type: 'string',
            },
            preview: {
                type: 'boolean',
                default: false,
            },
            resMode: {
                type: 'string',
                default: 'Desktop',
            },
            parentClasses: {
                type: 'array',
                default: [],
            },
            zoloStyles: {
                type: 'object',
            },
            selectedPanel: {
                type: 'string',
                default: 'first',
            },
            selectedStylePanel: {
                type: 'string',
                default: 'first',
            },
            selectedExtraPanel: {
                type: 'string',
                default: 'first',
            },
            selectedTab: {
                type: 'string',
                default: 'basic',
            },
            responsiveness: {
                type: 'object',
                default: {
                    hideDesktop: false,
                    hideTab: false,
                    hideMobile: false,
                },
            },
            customCss: {
                type: 'string',
                default: '',
            },
            zIndex: {
                type: 'number',
            },
            customClass: {
                type: 'string',
            },
            customClasses: {
                type: 'array',
                default: [],
            },
            zoloId: {
                type: 'string',
            },
            overflow: {
                type: 'string',
            },
            contentWidth: {
                type: 'string'
            },
            position: {
                type: 'object',
                default: {
                    value: '',
                    horizontalOrientation: {
                        direction: 'left',
                        offset: undefined,
                        unit: 'px',
                    },
                    verticalOrientation: {
                        direction: 'top',
                        offset: undefined,
                        unit: 'px',
                    },
                },
            },
};
    }
    return settings;
}

/**
 * Add controls and generate styles on Advanced Block Panel.
 *
 * @param {function} BlockEdit Block edit component.
 *
 * @return {function} BlockEdit Modified block edit component.
 */
const withAdvancedControls = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        const { attributes, setAttributes, name, clientId } = props;

        const blockType = select('core/blocks').getBlockType(name);

        if (blockType.category != 'zoloblocks') {
            return <BlockEdit {...props} />;
        }

        const { uniqueId, parentClasses } = attributes;
        const localStoreKey = uniqueId + 'loaded';

        window.onbeforeunload = function () {
            localStorage.clear();
        };
        //Handle Tab and Panel initial Open state
        useEffect(() => {
            // Prevent anchor link default behavior
            const anchorLinks = document.querySelectorAll('.zolo-block a');
            if (anchorLinks.length > 0) {
                anchorLinks.forEach((link) => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                    });
                });
            }

            const isPageLoadedStore = localStorage.getItem(localStoreKey);

            if (!isPageLoadedStore) {
                setAttributes({
                    selectedPanel: 'first',
                    selectedStylePanel: 'first',
                    selectedExtraPanel: 'first',
                    selectedTab: 'basic',
                });
                localStorage.setItem(localStoreKey, true);
            }
        }, []);

        const prefix = name.split('/')[1];
        // UseEffect for initial setting
        useEffect(() => {
            handleUniqueId({
                prefix,
                uniqueId,
                setAttributes,
                clientId,
            });

            //Load google fonts in editor
            let googleFontFamily = [];
            for (var key in attributes) {
                if (/^(\w+)FontFamily/.test(key) && attributes[key]) {
                    googleFontFamily.push(
                        attributes[key] +
                            ':100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic'
                    );
                }
            }
            if (googleFontFamily.length > 0) {
                let webFontConfig = {
                    google: {
                        families: googleFontFamily,
                    },
                    context: frames['editor-canvas'],
                };
                WebFont.load(webFontConfig);
            }
        }, []);

        //set Unique Id globally
        useEffect(() => {
            if (uniqueId) {
                const filteredParentClasses = parentClasses.filter((item) => !item.includes(`parent-${prefix}`));
                setAttributes({
                    parentClasses: [...filteredParentClasses, `zolo-block parent-${uniqueId}`],
                });
            }
        }, [uniqueId]);

        //Get Device type
        const deviceType = useSelect((select) => {
            return select('core/editor').getDeviceType();
        });

        // this useEffect is for setting the resMode attribute to desktop/tab/mobile depending on the added 'zolo-res-option-' class
        useEffect(() => {
            setAttributes({
                resMode: deviceType,
            });
        }, [deviceType]);

        return (
            <Fragment>
                <BlockEdit {...props} />
            </Fragment>
        );
    };
}, 'withAdvancedControls');

/**
 * Add Attributes Filter
 */
addFilter('blocks.registerBlockType', 'zoloblocks/hoc-global', addAttributes);

/**
 * Filter for modification of Edit Function
 */
addFilter('editor.BlockEdit', 'zoloblocks/hoc-global', withAdvancedControls);
