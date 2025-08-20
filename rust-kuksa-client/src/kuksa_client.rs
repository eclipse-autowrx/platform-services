// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

use std::collections::HashMap;
use tonic::transport::Channel;
use tonic::Request;
use tonic::Streaming;

use databroker_proto::kuksa::val::v1::val_client::ValClient;
use databroker_proto::kuksa::val::v1::EntryType;
use databroker_proto::kuksa::val::v1::Error;
use databroker_proto::kuksa::val::v1::{DataEntry, Datapoint};
use databroker_proto::kuksa::val::v1::{EntryRequest, EntryUpdate};
use databroker_proto::kuksa::val::v1::{Field, Metadata, View};
use databroker_proto::kuksa::val::v1::{GetRequest, SetRequest};
pub use databroker_proto::kuksa::val::v1::{SubscribeEntry, SubscribeRequest, SubscribeResponse};

use crate::common::{datatype_from_metadata, entrytype_from_metadata, str_to_value, ClientError};

pub struct KuksaClient {
    pub server_address: String,
    client: Option<ValClient<Channel>>,
}

impl KuksaClient {
    pub fn new(server_address: &str) -> Self {
        KuksaClient {
            server_address: server_address.to_string(),
            client: None,
        }
    }

    pub async fn connect(&mut self) -> Result<(), ClientError> {
        if self.client.is_some() {
            return Ok(());
        }

        ValClient::connect(self.server_address.clone())
            .await
            .map(|client| {
                self.client = Some(client);
            })
            .map_err(|_| ClientError::Connection("Can not connect ValClient".to_string()))
    }

    pub async fn get(
        &mut self,
        path: &str,
        view: i32,
        fields: Vec<i32>,
    ) -> Result<Vec<DataEntry>, ClientError> {
        let client = match self.client {
            None => {
                return Err(ClientError::Connection(
                    "Please connect to server".to_string(),
                ));
            }
            Some(ref mut client) => client,
        };

        let request = GetRequest {
            entries: vec![EntryRequest {
                path: path.to_string(),
                view: view,
                fields: fields,
            }],
        };

        let message = match client.get(Request::new(request)).await {
            Ok(response) => response.into_inner(),
            Err(error) => {
                return Err(ClientError::Status(error));
            }
        };

        // collect errors from response
        let mut errors = vec![];

        if let Some(err) = message.error {
            errors.push(err);
        }

        for error in message.errors {
            if let Some(err) = error.error {
                errors.push(err);
            }
        }

        // check if return error or entries' value
        if errors.len() > 0 {
            return Err(ClientError::Function(errors));
        } else {
            return Ok(message.entries);
        }
    }

    pub async fn set(&mut self, entries: Vec<EntryUpdate>) -> Result<(), ClientError> {
        let client = match self.client {
            None => {
                return Err(ClientError::Connection(
                    "Please connect to server".to_string(),
                ));
            }
            Some(ref mut client) => client,
        };

        let request = SetRequest { updates: entries };

        let message = match client.set(request).await {
            Ok(response) => response.into_inner(),
            Err(err) => return Err(ClientError::Status(err)),
        };

        // collect errors from response
        let mut errors = vec![];

        if let Some(err) = message.error {
            errors.push(err);
        }

        for error in message.errors {
            if let Some(err) = error.error {
                errors.push(err);
            }
        }

        if errors.len() > 0 {
            return Err(ClientError::Function(errors));
        } else {
            return Ok(());
        }
    }

    pub async fn subscribe(
        &mut self,
        entries: Vec<SubscribeEntry>,
    ) -> Result<Streaming<SubscribeResponse>, ClientError> {
        let client = match self.client {
            None => {
                // TODO: connect to server
                return Err(ClientError::Connection(
                    "Please connect to server".to_string(),
                ));
            }
            Some(ref mut client) => client,
        };

        let request = SubscribeRequest { entries };

        // call subcribes method
        match client.subscribe(request).await {
            Ok(response) => {
                return Ok(response.into_inner());
            }
            Err(err) => {
                return Err(ClientError::Status(err));
            }
        }
    }

    pub async fn is_actuator(&mut self, path: &str) -> Result<(), ClientError> {
        let metadatas = match self.get_metadata(path).await {
            Ok(metadatas) => metadatas,
            Err(error) => {
                return Err(error);
            }
        };

        let entrytype = match entrytype_from_metadata(&metadatas).await {
            Ok(entrytype) => entrytype,
            Err(err) => {
                // return METADATA error
                return Err(err);
            }
        };

        match entrytype.get(path) {
            Some(EntryType::Actuator) => Ok(()),
            _ => Err(ClientError::Function(vec![Error {
                code: 401,
                reason: "Entry is not an actuator".to_string(),
                message: "Entry is not an actuator".to_string(),
            }])),
        }
    }

    pub async fn get_metadata(
        &mut self,
        entry_path: &str,
    ) -> Result<HashMap<String, Metadata>, ClientError> {
        match self
            .get(
                entry_path,
                View::Metadata.into(),
                vec![Field::Metadata.into()],
            )
            .await
        {
            Ok(response) => {
                let mut result = HashMap::new();
                let data_entries = response.into_iter();

                for data_entry in data_entries {
                    if let Some(metadata) = data_entry.metadata {
                        result.insert(data_entry.path, metadata);
                    }
                }

                Ok(result)
            }
            Err(error) => {
                // Err: can not access GET METADATA method
                return Err(error);
            }
        }
    }

    pub async fn get_current_value(
        &mut self,
        path: &str,
    ) -> Result<Option<Datapoint>, ClientError> {
        match self
            .get(path, View::CurrentValue.into(), vec![Field::Value.into()])
            .await
        {
            Ok(entries) => {
                if entries.len() != 1 {
                    return Err(ClientError::Function(vec![Error {
                        code: 400,
                        reason: "Path is not a leaf entry".to_string(),
                        message: "Ensure your path is a sensor/actuator".to_string(),
                    }]));
                } else {
                    return Ok(entries[0].value.clone());
                }
            }
            Err(error) => {
                return Err(error);
            }
        }
    }

    pub async fn get_target_value(&mut self, path: &str) -> Result<Option<Datapoint>, ClientError> {
        self.is_actuator(path).await?;

        match self
            .get(
                path,
                View::TargetValue.into(),
                vec![Field::ActuatorTarget.into()],
            )
            .await
        {
            Ok(entries) => {
                if entries.len() != 1 {
                    return Err(ClientError::Function(vec![Error {
                        code: 400,
                        reason: "Path is not a leaf entry".to_string(),
                        message: "Ensure your path is a sensor/actuator".to_string(),
                    }]));
                } else {
                    return Ok(entries[0].actuator_target.clone());
                }
            }
            Err(error) => {
                return Err(error);
            }
        }
    }

    pub async fn set_current_value(
        &mut self,
        entry_path: &str,
        value: &str,
    ) -> Result<(), ClientError> {
        let metadatas = match self.get_metadata(entry_path).await {
            Ok(metadatas) => metadatas,
            Err(error) => {
                return Err(error);
            }
        };

        let datatype = match datatype_from_metadata(&metadatas).await {
            Ok(datatype) => datatype,
            Err(err) => {
                // return METADATA error
                return Err(err);
            }
        };

        if !datatype.contains_key(entry_path) {
            return Err(ClientError::Function(vec![Error {
                code: 401,
                reason: "Error retrieve metadata".to_string(),
                message: "Can not found metadata for path, path maybe not a leaf entry".to_string(),
            }]));
        }

        let entry_value = str_to_value(value, datatype[entry_path])?;

        let entry = EntryUpdate {
            fields: vec![Field::Value as i32],
            entry: Some(DataEntry {
                path: entry_path.to_string(),
                value: Some(Datapoint {
                    timestamp: Some(std::time::SystemTime::now().into()),
                    value: Some(entry_value),
                }),
                metadata: None,
                actuator_target: None,
            }),
        };

        self.set(vec![entry]).await
    }

    pub async fn set_target_value(
        &mut self,
        entry_path: &str,
        value: &str,
    ) -> Result<(), ClientError> {
        self.is_actuator(entry_path).await?;

        let metadatas = match self.get_metadata(entry_path).await {
            Ok(metadatas) => metadatas,
            Err(error) => {
                return Err(error);
            }
        };

        let datatype = match datatype_from_metadata(&metadatas).await {
            Ok(datatype) => datatype,
            Err(err) => {
                // return METADATA error
                return Err(err);
            }
        };

        if !datatype.contains_key(entry_path) {
            return Err(ClientError::Function(vec![Error {
                code: 401,
                reason: "Error retrieve metadata".to_string(),
                message: "Can not found metadata for path, path maybe not a leaf entry".to_string(),
            }]));
        }

        let entry_value = str_to_value(value, datatype[entry_path])?;

        let entry = EntryUpdate {
            fields: vec![Field::ActuatorTarget as i32],
            entry: Some(DataEntry {
                path: entry_path.to_string(),
                value: None,
                metadata: None,
                actuator_target: Some(Datapoint {
                    timestamp: Some(std::time::SystemTime::now().into()),
                    value: Some(entry_value),
                }),
            }),
        };

        self.set(vec![entry]).await
    }

    pub async fn subscribe_current_value(
        &mut self,
        entry_path: &str,
    ) -> Result<Streaming<SubscribeResponse>, ClientError> {
        let entries = vec![SubscribeEntry {
            path: entry_path.to_string(),
            view: View::CurrentValue.into(),
            fields: vec![Field::Value.into()],
        }];

        // call subcribes method
        self.subscribe(entries).await
    }

    pub async fn subscribe_target_value(
        &mut self,
        entry_path: &str,
    ) -> Result<Streaming<SubscribeResponse>, ClientError> {
        self.is_actuator(entry_path).await?;

        let entries = vec![SubscribeEntry {
            path: entry_path.to_string(),
            view: View::TargetValue.into(),
            fields: vec![Field::ActuatorTarget.into()],
        }];

        self.subscribe(entries).await
    }
}
