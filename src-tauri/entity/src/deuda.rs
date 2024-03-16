//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.14

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "deuda")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    pub cliente: i64,
    #[sea_orm(column_type = "Double")]
    pub monto: f64,
    pub pago: i64,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::cliente::Entity",
        from = "Column::Cliente",
        to = "super::cliente::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Cliente,
    #[sea_orm(
        belongs_to = "super::pago::Entity",
        from = "Column::Pago",
        to = "super::pago::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Pago,
}

impl Related<super::cliente::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Cliente.def()
    }
}

impl Related<super::pago::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Pago.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
