slint::include_modules!();
slint::slint!{
    export global Logic := {
        callback pagar(int,int);
    }
}
mod db;
mod mods;

fn main()->Result<(),slint::PlatformError> {

    let ui = AppWindow::new()?;
    let ui_handle = ui.as_weak();

    ui.on_request_increase_value(move || {
        let ui= ui_handle.unwrap();
        ui.set_counter(ui.get_counter() + 1);
    });
    ui.run()
}

