use super::{
    config::{Config, Formato, Mayusculas},
    lib::{camalize, Save},
    pesable::Pesable,
    producto::Producto,
    rubro::Rubro,
};
use Valuable as V;
use sea_orm::DbErr;
use serde::{Deserialize, Serialize};
use std::fmt::{self, Display};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Valuable {
    Prod((u16, Producto)),
    Pes((f32, Pesable)),
    Rub((u16, Rubro)),
}

impl Valuable {
    // pub fn get_price(&self, politica: f64) -> f64 {
    //     match self {
    //         V::Pes(a) => redondeo(politica, a.0 as f64 * a.1.precio_peso),
    //         V::Prod(a) => a.1.redondear(politica).precio_de_venta,
    //         V::Rub(a) => a.1.redondear(politica).monto,
    //     }
    // }
    // pub fn unifica_codes(&mut self) {
    //     match self {
    //         V::Prod(a) => a.1.unifica_codes(),
    //         _ => (),
    //     }
    // }
    pub fn get_descripcion(&self, conf: &Config) -> String {
        let mut res = match self {
            V::Pes(a) => a.1.get_descripcion().to_string(),
            V::Rub(a) => a.1.get_descripcion().to_string(),
            V::Prod(a) => match conf.get_formato() {
                Formato::Mtv => match a.1.get_presentacion() {
                    Presentacion::Gr(cant) => format!(
                        "{} {} {} {} Gr",
                        a.1.get_marca(),
                        a.1.get_tipo_producto(),
                        a.1.get_variedad(),
                        cant
                    ),
                    Presentacion::CC(cant) => format!(
                        "{} {} {} {} CC",
                        a.1.get_marca(),
                        a.1.get_tipo_producto(),
                        a.1.get_variedad(),
                        cant
                    ),
                    Presentacion::Kg(cant) => format!(
                        "{} {} {} {} Kg",
                        a.1.get_marca(),
                        a.1.get_tipo_producto(),
                        a.1.get_variedad(),
                        cant
                    ),
                    Presentacion::Lt(cant) => format!(
                        "{} {} {} {} Lt",
                        a.1.get_marca(),
                        a.1.get_tipo_producto(),
                        a.1.get_variedad(),
                        cant
                    ),
                    Presentacion::Ml(cant) => format!(
                        "{} {} {} {} Ml",
                        a.1.get_marca(),
                        a.1.get_tipo_producto(),
                        a.1.get_variedad(),
                        cant
                    ),
                    Presentacion::Un(cant) => format!(
                        "{} {} {} {} Un",
                        a.1.get_marca(),
                        a.1.get_tipo_producto(),
                        a.1.get_variedad(),
                        cant
                    ),
                },
                Formato::Tmv => format!(
                    "{} {} {}",
                    a.1.get_tipo_producto(),
                    a.1.get_marca(),
                    a.1.get_variedad()
                ),
            },
        };
        match conf.get_modo_mayus() {
            Mayusculas::Lower => res = res.to_lowercase(),
            Mayusculas::Upper => res = res.to_uppercase(),
            Mayusculas::Camel => res = camalize(res.as_str()).to_string(),
        }
        res
    }
}
impl Save for Valuable {
    async fn save(&self) -> Result<(), DbErr> {
        match self {
            V::Pes(a) => a.1.save().await,
            V::Prod(a) => a.1.save().await,
            V::Rub(a) => a.1.save().await,
        }
    }
}
// impl Default for Valuable {
//     fn default() -> Self {
//         V::Prod((1, Producto::default()))
//     }
// }
impl PartialEq for Valuable {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (V::Pes(a), V::Pes(b)) => *a.1.get_id() == *b.1.get_id(),
            (V::Prod(a), V::Prod(b)) => a.1.get_id() == b.1.get_id(),
            (V::Rub(a), V::Rub(b)) => a.1.get_id() == b.1.get_id(),
            (_, _) => false,
        }
    }
}

pub trait ValuableTrait {
    fn redondear(&self, politica: f64) -> Self;
}

impl ValuableTrait for Valuable {
    fn redondear(&self, politica: f64) -> Valuable {
        match self {
            V::Pes(a) => V::Pes(a.clone()),
            V::Prod(a) => V::Prod((a.0, a.1.redondear(politica))),
            V::Rub(a) => V::Rub((a.0, a.1.redondear(politica))),
        }
    }
}

impl Display for Presentacion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Gr(a) => write!(f, "{} Gr", a),
            Self::Lt(a) => write!(f, "{} Lt", a),
            Self::Un(a) => write!(f, "{} Un", a),
            Self::Ml(a) => write!(f, "{} Ml", a),
            Self::CC(a) => write!(f, "{} CC", a),
            Self::Kg(a) => write!(f, "{} Kg", a),
        }
    }
}
impl Default for Presentacion {
    fn default() -> Self {
        Presentacion::Un(i16::default())
    }
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone)]
pub enum Presentacion {
    Gr(f32),
    Un(i16),
    Lt(f32),
    Ml(i16),
    CC(i16),
    Kg(f32),
}
