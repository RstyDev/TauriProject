//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.10

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "producto")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    #[sea_orm(column_type = "Double")]
    pub precio_de_venta: f64,
    #[sea_orm(column_type = "Double")]
    pub porcentaje: f64,
    #[sea_orm(column_type = "Double")]
    pub precio_de_costo: f64,
    pub tipo_producto: String,
    pub marca: String,
    pub variedad: String,
    #[sea_orm(column_type = "String")]
    pub presentacion: Presentacion,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
pub enum Presentacion {
    Gr(f64),
    Un(i32),
    Lt(f64),
    Ml(i32),
    Cc(i32),
    Kg(f64),
}