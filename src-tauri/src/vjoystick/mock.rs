use crate::vjoystick::InputDevice;

pub struct MockDevice;

#[async_trait::async_trait]
impl InputDevice for MockDevice {
    async fn press_button(&mut self, button: u8, duration_millis: u64) {
        println!("[MOCK] press_button({}, {})", button, duration_millis);
    }
}