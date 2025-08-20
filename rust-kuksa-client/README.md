# sdv-rust-lib
> Github: https://github.com/nhan-orgs/sdv-rust-lib

This KuksaClient run on Kuksa Databroker version `0.3.0`

## 1. Project structure

```
sdv-rust-lib/
├── databroker-proto
├── proto
├── src
│   ├── kuksa_client.rs
│   ├── lib.rs
│   └── utils
│       ├── common.rs
│       └── mod.rs
├── Cargo.toml
├── Cargo.lock
├── README.md
└── target
```

* `databroker/` and `proto/` are protobuf definition directories, which are copied from the [kuksa-databroker](https://github.com/eclipse-kuksa/kuksa-databroker)
* `src/` contains source code of the library
* `Cargo.toml`: contains dependencies (libraries/packages...) - as `package.json` in NodeJS
* `target/` and `Cargo.lock`: automatically generated

## 2. Library modules
This library contains 2 main modules: `KuksaClient` and `utils::common`
### 2.1. KuksaClient
* KuksaClient is a structure, which implements `get`/`set`/`subscribe` methods to help vehicle applications communicate with sensors and actuators.
* Here are the suppoted methods:

    | Method                 | Description                                                                            |
    |------------|--------|
    | new                    | create a KuksaClient instance  and save the server address                             |
    | connect                | let the KuksaClient connect to the Kuksa Databroker at the saved  address              |
    | get_current_value      | get the current value of signal  (sensor/actuator)                                     |
    | get_target_value       | get the target value of signal  (ACTUATOR only)                                        |
    | set_current_value      | set the current value of signal  (sensor/actuator). Vehicle apps DO NOT USE this method |
    | set_target_value       | set the target value of signal  (ACTUATOR only)                                        |
    | subscibe_current_value | get notifications if the current value of the specific signal changes                  |
    | subscibe_target_value  | get notifications if the target value of the specific signal change (ACTUATOR only)   |

### 2.2. Util functions
| Type/Method                 | Description                                                                        |
|-------|-----|
| ClientError                 | an enum, specifies which type of error occurs                                      |
| str_to_value                | convert str type to Value type, use in KuksaClient; eg: ("bool", Boolean) --> bool |
| value_from_datapoint | extract Value from Option<Datapoint> - which are returned from get methods         |
| datatype_from_metadata      | get Datatype (String, Bool,...) of a signal from its metadata                      |
| entrytype_from_metadata     | get Entrytype (Sensor, Actuator,...) of a signal from its metadata                  |

## 3. How to use this library
* Clone the kuksa-broker server from [github](https://github.com/eclipse-kuksa/kuksa-databroker) and run:
    ```
    cargo run --bin databroker -- --metadata /home/vy/v-work/kuksa-databroker/data/vss-core/vss_release_3.0.json
    ```
* Clone the `simple-kuksa-client` library from [github](https://github.com/nhan-orgs/sdv-rust-lib)
* In `Cargo.toml`, replace the path of library
    ```
    [dependencies]
    simple-kuksa-client = { path = "../../sdv-rust-lib" }
    ```
* In source code file, add `use simple-kuksa-client;` and start writing code with `KuksaClient` :v

> Find some sample code from [sdv-rust-apps](https://github.com/nhan-orgs/sdv-rust-apps)

## 4. How to add new code to this library

### 4.1. Modify modules
* `KuksaClient`: make some changes in `sdv-rust-lib/src/kuksa_client.rs`
* `common`: modify in `sdv-rust-lib/src/utils/common.rs`

### 4.2. Add module/sub-module

#### 4.2.1. Add new sub-module in `utils/` (like `common`)
* Create a new file (`<new_sub_module>.rs`)  in `sdv-rust-lib/src/utils`
* Write code in new file
* In `sdv-rust-lib/src/utils/mod.rs`, add:
    ```
    pub mod <new_sub_module>;
    ```
#### 4.2.2. Add new module in `src/` (like `utils`)
* **Simple module:**
    * If your module only contains 1 file, place this file directly in `src/` (`<new_module>.rs`)
    * In `src/lib.rs`, add:
        ```
        pub mod <new_module>;

        pub use <new_module>::*; // not mandatory 
        ```
* **Complex module:**
    * Create a folder: `src/<new_module>/`
    * Create file `src/<new_module>/<sub_module1>.rs`
    * Create file `src/<new_module>/mod.rs` - where you assign all sub-modules: 
        ```
        pub mod <sub_module1>;
        // pub mod <sub_module2>;
        // ...
        ```

> Read more about `pub use` ([Stackoverflow](https://stackoverflow.com/questions/69275034/what-is-the-difference-between-use-and-pub-use))