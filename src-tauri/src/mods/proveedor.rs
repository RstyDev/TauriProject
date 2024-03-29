use chrono::Utc;
use entity::proveedor;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, Database, DatabaseConnection, DbErr, EntityTrait, QueryFilter,
    Set,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
type Res<T> = std::result::Result<T, AppError>;

use super::{
    error::AppError,
    lib::{Mapper, Save},
};

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
pub struct Proveedor {
    id: i64,
    nombre: Arc<str>,
    contacto: Option<i64>,
}

impl Proveedor {
    pub async fn new_to_db(
        nombre: &str,
        contacto: Option<i64>,
        db: &DatabaseConnection,
    ) -> Res<Proveedor> {
        match entity::proveedor::Entity::find()
            .filter(entity::proveedor::Column::Nombre.eq(nombre))
            .one(db)
            .await?
        {
            Some(_) => {
                return Err(AppError::ExistingError {
                    objeto: String::from("Proveedor"),
                    instancia: nombre.to_string(),
                })
            }
            None => {
                let model = entity::proveedor::ActiveModel {
                    updated_at: Set(Utc::now().naive_local()),
                    nombre: Set(nombre.to_string()),
                    contacto: Set(contacto),
                    ..Default::default()
                }
                .insert(db)
                .await?;
                Ok(Mapper::map_model_prov(&model))
            }
        }
    }
    pub fn new(id: i64, nombre: &str, contacto: Option<i64>) -> Self {
        Proveedor {
            id,
            nombre: Arc::from(nombre),
            contacto,
        }
    }
    pub fn nombre(&self) -> Arc<str> {
        Arc::clone(&self.nombre)
    }
    pub fn id(&self) -> &i64 {
        &self.id
    }
    pub fn contacto(&self) -> &Option<i64> {
        &self.contacto
    }
}
impl Save for Proveedor {
    async fn save(&self) -> Result<(), DbErr> {
        let model = proveedor::ActiveModel {
            id: Set(self.id),
            nombre: Set(self.nombre.to_string()),
            contacto: Set(self.contacto),
            updated_at: Set(Utc::now().naive_local()),
        };
        let db = Database::connect("sqlite://db.sqlite?mode=rwc").await?;
        println!("conectado");
        model.insert(&db).await?;
        Ok(())
    }
}
impl ToString for Proveedor {
    fn to_string(&self) -> String {
        let res;
        match self.contacto {
            Some(a) => res = format!("{} {}", self.nombre, a),
            None => res = format!("{}", self.nombre),
        }
        res
    }
}
