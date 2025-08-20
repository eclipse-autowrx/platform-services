// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Konva from 'konva';
import { Stage, Layer } from "react-konva";
import { Vector2d } from "konva/lib/types";
import _ from 'lodash';

import { SHAPE } from '../shapes/constant';
import {
    BCButton, BCUploadButton, BCCircularProgress,
    BCShapeList, ConfirmDialog, BCColorPicker, IconsDialog, ALL_ICONS,
} from '../common';
import {
    BCRectangle, IRectangle, IAllShape,
    IShape, BCEllipse, IEllipse,
    BCShapeIcon, BCText, IBCText, ITypeShape,
} from '../shapes';
import { ICONS } from '../common/bc-shape-list';
import { FONT_SIZE } from '../shapes/bc-text';

export const ASPECT_RATIO = 16 / 9;

export interface ISave {
    shapes?: IShape[];
    bgImage?: string;
    bgColor?: string;
}

interface IBCDrawArea {
    displayShapes?: IShape[];
    selectedShape?: IShape;
    bgImage?: string;
    displayBgColor?: string;
    viewOnly?: boolean;
    isChanged?: boolean;
    onDelete?: ( id: string ) => void;
    onSave?: ( data: ISave ) => void;
    onSelectedShape?: ( shape: IAllShape ) => void;
    onSetDisplayShapes?: ( shapes: IAllShape[], notChange?: boolean ) => void;
    handleUploadImage?: ( file: File ) => void;
    navigate?: ( url: string ) => void;
}

interface IParamStage {
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
}

const DEFAULT_DRAW_WIDTH = 900;
const DEFAULT_DRAW_HEIGHT = 600;
const DEFAULT_ICON_WIDTH = 35;
const DEFAULT_ICON_HEIGHT = 40;

// ANIMATION_MOUSE_MOVE_SHAPES will create in mousedown, else in mouseup
const ANIMATION_MOUSE_MOVE_SHAPES: string[] = [ SHAPE.RECTANGLE, SHAPE.ELLIPSE ];

const BCDrawArea = ( props: IBCDrawArea ) => {

    const {
        displayShapes, bgImage, viewOnly,
        displayBgColor, selectedShape, isChanged,
        onSave, onSelectedShape, onSetDisplayShapes,
        handleUploadImage, navigate, onDelete
    } = props;

    /**
     * useState
     */
    const [ shapeTypeSelected, setShapeTypeSelected ] = useState<any>( SHAPE.RECTANGLE );
    const [ openConfirmDialog, setOpenConfirmDialog ] = useState<boolean>();
    const [ isLoaded, setLoaded ] = useState<boolean>(true);
    const [ displayBgImage, setDisplayBgImage ] = useState<string>();
    const [ hex, setHex ] = useState<string>('#FFFFFF');
    const [ paramStage, setParamStage ] = useState<IParamStage>({ width: 0, height: 0, scaleX: 0, scaleY: 0 });
    const [ changed, setChanged ] = useState<boolean>();
    const [ openIconDialog, setOpenIconDialog ] = useState<boolean>();

    /**
     * useRef
     */
    const stageRef = useRef<Konva.Stage>(null);
    const isMouseDownRef = useRef<boolean>(false);

    useEffect( () => setChanged( isChanged ), [ isChanged ] );
    useEffect( () => setHex( displayBgColor || '#FFFFFF' ), [ displayBgColor ] );
    useEffect( () => {
        if ( bgImage === displayBgImage ) return;

        setDisplayBgImage( bgImage );
        setLoaded( !bgImage );
    }, [ bgImage ] );
    useEffect( () => {
        document.addEventListener( 'mousedown', () => isMouseDownRef.current = true );
        document.addEventListener( 'mouseup', () => isMouseDownRef.current = false );

        const resizeObservable  = new ResizeObserver( entries => {
            const { clientWidth, clientHeight } = entries[0].target;
            if ( !clientWidth || !clientHeight ) return;

            const width: number = clientWidth;
            const height: number = clientWidth / ASPECT_RATIO;

            const param: IParamStage = {
                width,
                height,
                scaleX: width / DEFAULT_DRAW_WIDTH,
                scaleY: height / DEFAULT_DRAW_HEIGHT,
            };

            onSetParamsStage.cancel();
            onSetParamsStage( param );
        },);

        resizeObservable.observe(document.getElementById('draw-area-id'));
    }, [] );

    /**
     * @return {void}
     */
    const checkKeyPress = useCallback(({ keyCode }) => {
        if ( viewOnly || keyCode !== 46 || !selectedShape?.id ) return;

        setOpenConfirmDialog( true );
    }, [ selectedShape ]);
    
    useEffect( () => {
        window.addEventListener("keydown", checkKeyPress);
        return () => window.removeEventListener("keydown", checkKeyPress);
    }, [ checkKeyPress ] );

    /**
     * @param {string} color
     * @return {void}
     */
    const onSetHex = ( color: string ) => {
        setHex(color);
        !changed && setChanged( true );
    }

    /**
     * @param {IParamStage} param
     * @return {void}
     */
    const onSetParamsStage = useCallback( _.debounce( ( param: IParamStage ) => {
        setParamStage( param );
    }), [])

    /**
     * @return {void}
     */
    const onShapeActionStart = () => {
        if ( !displayShapes?.length ) return;

        const last: IAllShape = _.last( displayShapes );

        if ( last.id ) return;

        displayShapes.pop();
        onSetDisplayShapes && onSetDisplayShapes([ ...displayShapes ]);
    }

    /**
     * @param {IAllShape} shape
     * @param {number} idx
     * @param {boolean=} isClosed
     * @return {void}
     */
    const onShapeActionEnd = ( shape: IAllShape, idx: number, isClosed?: boolean ) => {
        if ( viewOnly ) return;

        displayShapes[ idx ] = { ...displayShapes[ idx ], ...shape };

        onSetDisplayShapes && onSetDisplayShapes([ ...displayShapes ]);
        !isClosed && onSelectedShape && onSelectedShape( displayShapes[ idx ] );
    }

    /**
     * @param {number} val
     * @return {void}
     */
    const getX = ( val: number ) => {
        return parseInt( ( val / paramStage.scaleX ).toString() );
    }

    /**
     * @param {number} val
     * @return {void}
     */
    const getY = ( val: number ) => {
        return parseInt( ( val / paramStage.scaleY ).toString() );
    }

    /**
     * @param {string} cursor
     * @return {void}
     */
    const onChangePointer = ( cursor?: string ) => {
        stageRef.current.container().style.cursor = cursor || 'default';
    }

    /**
     * @param {ITypeShape} type
     * @return {void}
     */
    const initShape = ( type: ITypeShape ) => {
        const pos: Vector2d =  stageRef?.current?.getPointerPosition();

        if ( !pos ) return;

        let addShape: IAllShape = { type, id: null };

        switch ( true ) {
            case _.includes( [ SHAPE.RECTANGLE ], type ):
                addShape = {
                    ...addShape,
                    x: getX( pos.x ),
                    y: getY( pos.y ),
                    width: 0,
                    height: 0,
                };
                break;
            case _.includes( [ SHAPE.ELLIPSE ], type ):
                addShape = {
                    ...addShape,
                    x: getX( pos.x ),
                    y: getY( pos.y ),
                    startX: getX( pos.x ),
                    startY: getY( pos.y ),
                    width: 0,
                    height: 0,
                    radiusX: 0,
                    radiusY: 0,
                };
                break;
            case _.includes( [ SHAPE.TEXT ], type ):
                addShape = {
                    ...addShape,
                    x: getX( pos.x ),
                    y: getY( pos.y ),
                    width: 150,
                    height: 40,
                    text: '',
                    fill: 'black',
                    fontSize: FONT_SIZE.SMALL.value,
                    edit: true,
                }; 
                break;
            case _.includes( ICONS, type ):
                addShape = {
                    ...addShape,
                    x: getX( pos.x ) - DEFAULT_ICON_WIDTH / 2,
                    y: getY( pos.y ) - DEFAULT_ICON_HEIGHT / 2 - 10,
                    width: DEFAULT_ICON_WIDTH,
                    height: DEFAULT_ICON_HEIGHT,
                };
                break;
        }

        displayShapes.push( addShape );
    }

    /**
     * @param {ITypeShape} type
     * @return {void}
     */
    const animationMouseMoveShape = ( type: ITypeShape ) => {
        const lastShape: IAllShape = _.last( displayShapes );

        if ( lastShape.id ) return;

        const pos: Vector2d = stageRef.current.getPointerPosition();

        switch ( type ) {
            case SHAPE.RECTANGLE:
                const curRec: IRectangle = lastShape;
                curRec.width = getX( pos.x ) - curRec.x;
                curRec.height = getY( pos.y ) - curRec.y;
                break;
            case SHAPE.ELLIPSE:
                const curEllepse: IEllipse = lastShape;
                const radiusX: number = Math.abs(getX( pos.x ) - curEllepse.startX) / 2;
                const radiusY: number = Math.abs(getY( pos.y ) - curEllepse.startY) / 2;
                const addX: number = getX( pos.x ) > curEllepse.startX ? curEllepse.startX : getX( pos.x );
                const addY: number = getY( pos.y ) > curEllepse.startY ? curEllepse.startY : getY( pos.y );
                curEllepse.radiusX = radiusX;
                curEllepse.radiusY = radiusY;
                curEllepse.x = radiusX + addX;
                curEllepse.y = radiusY + addY;
                curEllepse.width = radiusX / 2;
                curEllepse.height = radiusY / 2;
                break;
        }

        onSetDisplayShapes && onSetDisplayShapes([ ...displayShapes ], true);
    }

    /**
     * @return {void}
     */
    const onMouseDown = () => {
        if ( viewOnly || selectedShape?.id || !_.includes( ANIMATION_MOUSE_MOVE_SHAPES, shapeTypeSelected ) ) return;

        initShape( shapeTypeSelected );
    }

    /**
     * @return {void}
     */
    const onMouseMove = () => {
        if ( viewOnly || !displayShapes?.length || !_.includes( ANIMATION_MOUSE_MOVE_SHAPES, shapeTypeSelected ) ) return;

        isMouseDownRef.current ? animationMouseMoveShape( shapeTypeSelected ) : createShape();
    }

    /**
     * @return {void}
     */
    const onMouseUp = () => {
        if ( viewOnly || selectedShape?.id ) return;

        !_.includes( ANIMATION_MOUSE_MOVE_SHAPES, shapeTypeSelected ) && initShape( shapeTypeSelected );
        createShape();
    }

    /**
     * @return {void}
     */
    const createShape = () => {
        const last: IAllShape = _.last( displayShapes );

        if ( last?.id ) return;

        if ( !last?.width || !last?.height ) {
            displayShapes.pop();
            onSetDisplayShapes && onSetDisplayShapes([ ...displayShapes ], true);
            return;
        }

        last.id = Date.now().toString(36);
        onSelectedShape && onSelectedShape( last );
        onSetDisplayShapes && onSetDisplayShapes([ ...displayShapes ]);
    }

    /**
     * @return {void}
     */
    const save = () => {
        if ( !onSave ) return;

        const shapes: IShape[] = _.reject( displayShapes, ( shape: IShape ) => !shape.id );

        onSetDisplayShapes && onSetDisplayShapes(shapes);
        onSave({ shapes, bgImage: displayBgImage, bgColor: hex });
    }

    /**
     * @return {void}
     */
    const onYes = () => {
        onDelete && onDelete( selectedShape?.id );
        setOpenConfirmDialog(false);
    }

    /**
     * @return {void}
     */
    const onNo = () => {
        setOpenConfirmDialog(false);
    }

    /**
     * @return {Element}
     */
    const renderStage = () => {
        if ( !isLoaded ) return <div className="flex items-center justify-center h-full relative bg-slate-200/50"> <BCCircularProgress /> </div>;

        return (
            <Stage
                ref={stageRef}
                width={paramStage?.width}
                height={paramStage?.height}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove} >
                <Layer>
                    {
                        displayShapes?.length > 0 && (
                            _.map( displayShapes, ( shape: IAllShape, idx: number ) => {
                                const _curShape: IAllShape = {
                                    ...shape, viewOnly,
                                    isFocus: selectedShape?.id === shape.id,
                                    scaleX: paramStage.scaleX,
                                    scaleY: paramStage.scaleY,
                                    onSelectedShape, onShapeActionStart, onChangePointer, navigate,
                                    onShapeActionEnd: ( ( item: IAllShape, isClose?: boolean ) => onShapeActionEnd( item, idx, isClose ) ),
                                }

                                switch ( shape.type ) {
                                    case SHAPE.RECTANGLE: return <BCRectangle {..._curShape} />;
                                    case SHAPE.ELLIPSE: return <BCEllipse {..._curShape} />
                                    case SHAPE.TEXT: return <BCText {..._curShape} />
                                    case SHAPE.CLOSE: return <BCShapeIcon {..._curShape} name={ALL_ICONS.CLOSE} fill="#BE3144" />
                                    case SHAPE.PIN: return <BCShapeIcon {..._curShape} name={ALL_ICONS.LOCATION} fill="#BE3144" />
                                    case SHAPE.LIKE: return <BCShapeIcon {..._curShape} name={ALL_ICONS.LIKE} fill="#1976d2" />
                                    case SHAPE.DISLIKE: return <BCShapeIcon {..._curShape} name={ALL_ICONS.DISLIKE} fill="#BE3144" />
                                    case SHAPE.SAND_CLOCK: return <BCShapeIcon {..._curShape} name={ALL_ICONS.SAND_CLOCK} fill="#FFC436" />
                                    case SHAPE.ONE: return <BCShapeIcon {..._curShape} name={ALL_ICONS.ONE} fill="#BE3144" />
                                    case SHAPE.TWO: return <BCShapeIcon {..._curShape} name={ALL_ICONS.TWO} fill="#FFA33C" />
                                    case SHAPE.THREE: return <BCShapeIcon {..._curShape} name={ALL_ICONS.THREE} fill="#FFFB73" />
                                    case SHAPE.FOUR: return <BCShapeIcon {..._curShape} name={ALL_ICONS.FOUR} fill="#45FFCA" />
                                    case SHAPE.FIVE: return <BCShapeIcon {..._curShape} name={ALL_ICONS.FIVE} fill="#3D30A2" />
                                }
                            } )
                        )
                    }
                </Layer>
            </Stage>
        );
    }

    return (
        <div className='flex flex-col border border-solid border-slate-200 w-full h-full relative'>
            <IconsDialog open={openIconDialog} onClose={() => setOpenIconDialog( false ) } />
            <ConfirmDialog
                open={openConfirmDialog}
                title='Remove'
                content='Do you want to remove this shape?'
                onYes={onYes}
                onNo={onNo} />
            {
                !viewOnly && (
                    <div className="flex p-2 bg-slate-200" >
                        <div className="flex-1">
                            <BCShapeList
                                disabled={!isLoaded}
                                type={shapeTypeSelected}
                                handleChange={(type: any) => setShapeTypeSelected( type ) }/>
                        </div>
                        {/* {
                            process?.env?.MODE === 'DEVELOPER' && (
                                <BCButton
                                    variant="outlined"
                                    text="Icons"
                                    className="mr-2.5"
                                    width="50px"
                                    height="40px"
                                    onClick={() => setOpenIconDialog( true )} />
                            )
                        } */}
                        <BCColorPicker
                            isShowFillIcon={true}
                            disabled={!isLoaded}
                            hex={hex}
                            setHex={onSetHex} />
                        <BCUploadButton
                            disabled={!isLoaded}
                            text="Upload Image"
                            className="ml-2.5"
                            width="150px"
                            height="40px"
                            handleUploadImage={( event ) => handleUploadImage( event.target.files[0] )} />
                        <BCButton
                            disabled={!isLoaded || !changed}
                            variant="contained"
                            text="Save"
                            icon={{ name: "save-disk", fill: "white" }}
                            className="ml-1"
                            width="100px"
                            height="40px"
                            onClick={save} />
                    </div>
                )
            }
            <div style={{ background: hex, aspectRatio: ASPECT_RATIO }} className="w-full relative" id='draw-area-id'>
                { displayBgImage && <img src={displayBgImage} onLoad={() => setLoaded(true)} className="w-full h-full object-contain absolute" /> }
                { renderStage() }
            </div>
        </div>
    );
}

export default BCDrawArea;