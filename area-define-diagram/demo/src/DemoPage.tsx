// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import React, { useEffect, useState } from "react";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import NodeManager from "./NodeManager";
import { ImageAreaEdit, ImageAreaPreview, IShape } from "./components";
// import { ImageAreaPreview, ImageAreaEdit, IShape } from "image-area-lib";

const PROJECT_ID = "demo";
const MASTER_ITEM = "master";
const DB_URL = "https://lightdb.digitalauto.tech"


const DemoPage = ({}) => {
    const [shapes, setShapes] = useState<IShape[]>([]);
    const [bgImage, setBgImage] = useState<string>("");
    const [activeNodeId, setActiveNodeId] = useState<string>("");

    const [isEditMode, setIsEditMode] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>( false );

    const navigate = useNavigate()

    useEffect(() => {
        getNodeData()
    }, [activeNodeId]);


    const updateShapeToDB = async (shapes, bgImage) => {
        if(!activeNodeId) return null
        try {
            let res = await axios.put(`${DB_URL}/project/${PROJECT_ID}/item/${activeNodeId}`, {content: {shapes, bgImage}})
            if(res.data && res.data.status == "OK") {
                return "OK"
            }
        } catch(err) {
            console.log(err)
        }
        return null
    }

    const getNodeData = async () => {
        if(!activeNodeId) {
            setBgImage("")
            setShapes([])
            return
        }
        try {
            let res = await axios.get(`${DB_URL}/project/${PROJECT_ID}/item/${activeNodeId}`)
            if(res.data && res.data.status == "OK" && res.data.content) {
                let item = res.data.content
                setActiveNodeId(item._id)
                setBgImage(item.content?.bgImage)
                setShapes(item.content?.shapes)
            }
        } catch(err){
            console.log(err)
        }
    }


  const onSave = (data: any) => {
    console.log("onSave", data);
    if(!data) return;
    setShapes(data.shapes || []);
    setBgImage(data.bgImage || "");

    updateShapeToDB(data.shapes || [], data.bgImage || '')
  };

  const handleUploadImage = async ( file: File ) => {
    setIsLoading( true );

    const formData = new FormData()
    formData.append("path", `/${file.name}`);
    formData.append("uploaded_file", file);
    await axios.post(
        'https://bewebstudio.digitalauto.tech/project/AJ8Evlgwklz1/upload-file?excludeRoot=false&&force=true',
        formData,
        { headers: { 'Content-Type': 'form-data/multipart'} },
    )
    .then(( { data }: any ) => {
        setBgImage( data.fileLink );
        setIsLoading( false );
    } )
    .catch( ( err ) => {
        setIsLoading( false );
        console.log( err )
    } );
  }

  const handleNavigate = ( url: string ) => {
    url.toLowerCase().startsWith( "http" )
        ? window.open( url, '_blank' )
        : navigate(url);
  };

  return (
    <div className="">
        <div className="flex px-2 mt-1">
            <div className="grow"></div>
            <div className="flex rounded bg-slate-200 p-1 text-slate-600 text-xs font-semibold">
                <div className={`w-[70px] text-center px-2 py-1 mr-2 cursor-pointer rounded ${!isEditMode?'bg-sky-400':'transparent'}`}
                    onClick={() => { setIsEditMode(false)}}>
                    Present
                </div>
                <div className={`w-[70px] text-center px-2 py-1 rounded cursor-pointer ${isEditMode?'bg-sky-400':'transparent'}`}
                    onClick={() => { setIsEditMode(true)}}>
                    Edit
                </div>
            </div>
        </div>
        <div className="w-full flex justify-center mt-4">
            <div className="w-[280px] min-w-[280px] border-r">
                <NodeManager onNodeIdChanged={(nodeId: any) => setActiveNodeId(nodeId)}/>
            </div>
            <div className="grow" style={{ maxWidth: '900px' }}>
                { !isEditMode && <ImageAreaPreview shapes={shapes} bgImage={bgImage} navigate={handleNavigate} /> }
                { isEditMode && <ImageAreaEdit shapes={shapes} bgImage={bgImage} onSave={onSave} handleUploadImage={handleUploadImage} /> }
            </div>
        </div>
    </div>
  );
};

export default DemoPage;
