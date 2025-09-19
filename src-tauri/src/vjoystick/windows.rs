use log::debug;
use vjoy::{ButtonState, VJoy};
use crate::vjoystick::InputDevice;

pub struct VJoyDevice {
    pub vjoy: VJoy,
    pub device_id: u32,
}

#[async_trait::async_trait]
impl InputDevice for VJoyDevice {
    async fn press_button(&mut self, button: u8, duration_millis: u64) {
        debug!("Press button {} with duration {}", button, duration_millis);
        let mut device = self.vjoy.get_device_state(self.device_id).unwrap();
        device.set_button(button, ButtonState::Pressed).unwrap();
        self.vjoy.update_device_state(&device).unwrap();

        tokio::time::sleep(std::time::Duration::from_millis(duration_millis)).await;

        device.set_button(button, ButtonState::Released).unwrap();
        self.vjoy.update_device_state(&device).unwrap();
    }
}
