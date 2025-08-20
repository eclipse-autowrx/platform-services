// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React from "react";

import { IAllShape } from '../shapes';

interface IBCFormEditor {
    shape?: IAllShape;
    onChange?: (shape: IAllShape) => void;
}

const BCFormEditor = ( props: IBCFormEditor ) => {

    const { shape, onChange } = props;

   /**
   * @param {string} property
   * @param {value} value
   * @return {void}
   */
  const setSettings = (property: string, value: any) => {
    shape[property] = value?.target?.value;

    onChange(shape);
  };

  return (
    <div className="text-slate-700 flex flex-col w-full">
        <div>URL:</div>
        <textarea
        	className="text-slate-700 mt-1 block w-full p-2 text-xs bg-slate-100"
        	rows={3}
        	value={shape?.url || ''}
        	onChange={(value: any) => setSettings("url", value)}
        	placeholder="Enter URL.">
		</textarea>
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

export default BCFormEditor;