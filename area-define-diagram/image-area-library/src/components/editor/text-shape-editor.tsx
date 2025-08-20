// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useEffect, useState } from "react";
import styled from 'styled-components';
import _ from 'lodash';

import { IBCText } from '../shapes';
import { BCButton, BCColorPicker } from "../common";
import { FONT_SIZE } from "../shapes/bc-text";

interface IBCTextShapeEditor {
    shape?: IBCText;
    onChange?: (shape: IBCText) => void;
}

const MenuStyle = styled.div`
    width: 100px;
    max-height: 200px;
    text-align: left;
    padding: 10px;
	font-weight: normal;

	&.active {
		background-color: #b8d6ff;
	}
`;

const BCTextShapeEditor = ( props: IBCTextShapeEditor ) => {

    const { shape, onChange } = props;

	/**
	 * useState
	 */
	const [ fontSizeLabel, setFontSizeLabel ] = useState<string>();

	/**
	 * useEffect
	 */
	useEffect( () => {
		if ( !shape ) return;

		switch ( shape.fontSize ) {
			case FONT_SIZE.SMALL.value:
				setFontSizeLabel( FONT_SIZE.SMALL.label );
				break;
			case FONT_SIZE.MEDIUM.value:
				setFontSizeLabel( FONT_SIZE.MEDIUM.label );
				break;
			case FONT_SIZE.LARGE.value:
				setFontSizeLabel( FONT_SIZE.LARGE.label );
				break;
			case FONT_SIZE.EXTRA_LARGE.value:
				setFontSizeLabel( FONT_SIZE.EXTRA_LARGE.label );
				break;
		}
	}, [ shape ] );

   /**
   	* @param {string} property
   	* @param {value} value
   	* @return {void}
   	*/
  	const setSettings = (property: string, value: any) => {
    	shape[property] =  value?.target?.value;

	    onChange(shape);
  	};

	/**
   	 * @return {HTMLDivElement[]}
   	 */
	const renderMenu = () : HTMLDivElement[] => {
		return _.map( _.keys( FONT_SIZE ), ( key: string ) =>
			<MenuStyle
				className={`${FONT_SIZE[key].value === shape?.fontSize ? 'active' : ''}`}
				onClick={() => setSettings( 'fontSize', { target: { value: FONT_SIZE[key].value } })}>
				{ FONT_SIZE[key].label }
			</MenuStyle>
		);
	}

  return (
    <div className="text-slate-700 flex flex-col w-full">
        <div className="flex items-center">
        	<div className="mr-2">Text Color:</div>
          	<BCColorPicker
				hex={shape?.fill || '#000000'}
				setHex={( color: string ) => setSettings('fill', { target: { value: color } })} />
        </div>
		<div className="flex items-center mt-2">
			<div className="mr-2">Font Size:</div>
			<BCButton
				height="30px"
				color="black"
				variant="contained"
				bgColor="transparent"
				className="ml-0.5 border-solid border-2 border-gray-500 p-2 text-sm"
				text={fontSizeLabel}
				menu={ renderMenu() } />
		</div>
		<div className="mt-2">
			<div>URL:</div>
			<textarea
				className="text-slate-700 mt-1 block w-full p-2 text-xs bg-slate-100"
				rows={3}
				value={shape?.url || ''}
				onChange={(value: any) => setSettings("url", value)}
				placeholder="Enter URL.">
			</textarea>
		</div>
      	<div className="mt-4">
        	<div>Hover message:</div>
        	<textarea
        		className="text-slate-700 mt-1 block w-full p-2 text-xs bg-slate-100"
        		rows={5}
        		value={shape?.hoverMessage || ''}
        		onChange={(value: any) => setSettings("hoverMessage", value)}
        		placeholder="Hover message ...">
			</textarea>
      	</div>
    </div>
  );
}

export default BCTextShapeEditor;