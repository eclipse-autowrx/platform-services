// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState } from "react";
import Button from '@mui/material/Button';

import { ImageArea, ImageAreaEdit, ImageAreaPreview } from './components';
import './app.scss';

const App = () => {

	const [ mode, setMode ] = useState<any>( 'Preview' );

	/**
	 * @param {string} newMode
	 */
	const handleSetMode = ( newMode: string ) => {
		newMode !== mode && setMode( newMode );
	}

	return (
		<div className="app-container">
			<div className="app-container__header">
				<Button
					variant="contained"
					className={`custom-btn ${mode === 'Preview' && 'active'}`}
					onClick={() => handleSetMode( 'Preview' )}>
					Preview
				</Button>
				<Button
					variant="contained"
					className={`custom-btn ${mode === 'Edit' && 'active'}`}
					onClick={() => handleSetMode( 'Edit' )}
					style={{ marginLeft: '10px' }}>
					Editing
				</Button>
			</div>
			<div className="app-container__content">
				<ImageArea mode={mode} />
			</div>
		</div>
	)
};

export default App;
