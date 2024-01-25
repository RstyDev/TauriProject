//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.10

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "codigo_barras")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    #[sea_orm(unique)]
    pub codigo: i64,
    pub producto: i64,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::producto::Entity",
        from = "Column::Producto",
        to = "super::producto::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Producto,
}

impl Related<super::producto::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Producto.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
