//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.14

use chrono::NaiveDateTime;
use sea_orm::entity::prelude::*;
#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "movimiento")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    pub caja: i64,
    pub tipo: bool,
    #[sea_orm(column_type = "Double")]
    pub monto: f64,
    pub descripcion: Option<String>,
    pub time: NaiveDateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::caja::Entity",
        from = "Column::Caja",
        to = "super::caja::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Caja,
}

impl Related<super::caja::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Caja.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
