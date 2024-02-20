use chrono::NaiveDateTime;
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use serde::Serialize;
use std::sync::Arc;

use super::error::AppError;
type Res<T> = std::result::Result<T, AppError>;
#[derive(Serialize, Clone, Debug)]
pub enum Cliente {
    Final(Arc<str>),
    Regular(Cli),
}

#[derive(Serialize, Clone, Debug)]
pub struct Cli {
    id: i64,
    nombre: Arc<str>,
    dni: i64,
    credito: bool,
    activo: bool,
    created: NaiveDateTime,
}
impl Cli {
    pub async fn new_to_db(
        db: &DatabaseConnection,
        nombre: &str,
        dni: i64,
        credito: bool,
        activo: bool,
        created: NaiveDateTime,
    ) -> Res<Cli> {
        match entity::cliente::Entity::find()
            .filter(entity::cliente::Column::Dni.eq(dni))
            .one(db)
            .await?
        {
            Some(_) => {
                return Err(AppError::ExistingError {
                    objeto: "Cliente".to_string(),
                    instancia: format!("{}", dni),
                })
            }
            None => {
                let model = entity::cliente::ActiveModel {
                    nombre: Set(nombre.to_string()),
                    dni: Set(dni),
                    credito: Set(credito),
                    activo: Set(activo),
                    created: Set(created),
                    ..Default::default()
                };
                let res = entity::cliente::Entity::insert(model).exec(db).await?;
                Ok(Cli {
                    id: res.last_insert_id,
                    nombre: Arc::from(nombre),
                    dni,
                    credito,
                    activo,
                    created,
                })
            }
        }
    }
    pub fn id(&self) -> &i64 {
        &self.id
    }
}

impl<'a> Cliente {
    pub fn new(cli: Option<Cli>) -> Cliente {
        match cli {
            Some(a) => Cliente::Regular(a),
            None => Cliente::Final(Arc::from("Consumidor Final")),
        }
    }
}
impl Default for Cliente {
    fn default() -> Self {
        Cliente::Final(Arc::from("Consumidor Final"))
    }
}