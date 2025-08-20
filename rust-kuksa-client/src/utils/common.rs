// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

use std::collections::HashMap;

pub use databroker_proto::kuksa::val::v1::{datapoint::Value, DataType, Datapoint, Error};
use databroker_proto::kuksa::val::v1::{EntryType, Metadata};

#[derive(Debug, Clone)]
pub enum ClientError {
    Connection(String),
    Status(tonic::Status),
    Function(Vec<Error>),
    Parse(String),
}

// convert a str to Value
pub fn str_to_value(input: &str, datatype: DataType) -> Result<Value, ClientError> {
    // eg: (Float, "10.1") --> 10.1

    match datatype {
        DataType::String => Ok(Value::String(input.to_owned())),
        DataType::Boolean => match input.parse::<bool>() {
            Ok(value) => Ok(Value::Bool(value)),
            Err(_err) => Err(ClientError::Parse("Parse Boolean error".to_string())),
        },
        DataType::Int8 => match input.parse::<i8>() {
            Ok(value) => Ok(Value::Int32(value as i32)),
            Err(_err) => Err(ClientError::Parse("Parse Int8 error".to_string())),
        },
        DataType::Int16 => match input.parse::<i16>() {
            Ok(value) => Ok(Value::Int32(value as i32)),
            Err(_err) => Err(ClientError::Parse("Parse Int16 error".to_string())),
        },
        DataType::Int32 => match input.parse::<i32>() {
            Ok(value) => Ok(Value::Int32(value)),
            Err(_err) => Err(ClientError::Parse("Parse Int32 error".to_string())),
        },
        DataType::Int64 => match input.parse::<i64>() {
            Ok(value) => Ok(Value::Int64(value)),
            Err(_err) => Err(ClientError::Parse("Parse Int64 error".to_string())),
        },
        DataType::Uint8 => match input.parse::<u8>() {
            Ok(value) => Ok(Value::Uint32(value as u32)),
            Err(_err) => Err(ClientError::Parse("Parse Uint8 error".to_string())),
        },
        DataType::Uint16 => match input.parse::<u16>() {
            Ok(value) => Ok(Value::Uint32(value as u32)),
            Err(_err) => Err(ClientError::Parse("Parse Uint16 error".to_string())),
        },
        DataType::Uint32 => match input.parse::<u32>() {
            Ok(value) => Ok(Value::Uint32(value)),
            Err(_err) => Err(ClientError::Parse("Parse Uint32 error".to_string())),
        },
        DataType::Uint64 => match input.parse::<u64>() {
            Ok(value) => Ok(Value::Uint64(value)),
            Err(_err) => Err(ClientError::Parse("Parse Uint64 error".to_string())),
        },
        DataType::Float => match input.parse::<f32>() {
            Ok(value) => Ok(Value::Float(value)),
            Err(_err) => Err(ClientError::Parse("Parse Float error".to_string())),
        },
        DataType::Double => match input.parse::<f64>() {
            Ok(value) => Ok(Value::Double(value)),
            Err(_err) => Err(ClientError::Parse("Parse Double error".to_string())),
        },
        _ => Err(ClientError::Parse("Datatype is not supported".to_string())),
        // DataType::Unspecified => todo!(),
        // DataType::Timestamp => todo!(),
        // DataType::StringArray => todo!(),
        // DataType::BooleanArray => todo!(),
        // DataType::Int8Array => todo!(),
        // DataType::Int16Array => todo!(),
        // DataType::Int32Array => todo!(),
        // DataType::Int64Array => todo!(),
        // DataType::Uint8Array => todo!(),
        // DataType::Uint16Array => todo!(),
        // DataType::Uint32Array => todo!(),
        // DataType::Uint64Array => todo!(),
        // DataType::FloatArray => todo!(),
        // DataType::DoubleArray => todo!(),
        // DataType::TimestampArray => todo!(),
    }
}

pub fn value_from_datapoint(datapoint: Option<Datapoint>) -> Option<Value> {
    if let Some(data) = datapoint {
        return data.value;
    }
    return None;
}

pub async fn datatype_from_metadata(
    metadatas: &HashMap<String, Metadata>,
) -> Result<HashMap<String, DataType>, ClientError> {
    let mut result = HashMap::new();

    for metadata in metadatas {
        let datatype = match DataType::try_from(metadata.1.data_type) {
            Ok(datatype) => datatype,
            Err(_error) => {
                return Err(ClientError::Function(vec![]));
            }
        };
        result.insert(metadata.0.to_owned(), datatype);
    }

    Ok(result)
}

pub async fn entrytype_from_metadata(
    metadatas: &HashMap<String, Metadata>,
) -> Result<HashMap<String, EntryType>, ClientError> {
    let mut result = HashMap::new();

    // println!("{:?}", metadatas);
    for metadata in metadatas {
        let entrytype = match EntryType::try_from(metadata.1.entry_type) {
            Ok(entrytype) => entrytype,
            Err(_error) => {
                return Err(ClientError::Function(vec![]));
            }
        };
        result.insert(metadata.0.to_owned(), entrytype);
    }

    Ok(result)
}
