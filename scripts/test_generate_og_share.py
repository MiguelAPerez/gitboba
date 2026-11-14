import unittest

from generate_og_share import H, W, phone_layout


class PhoneLayoutTest(unittest.TestCase):
    def test_scales_to_target_height_and_keeps_aspect(self):
        w, h, _, _ = phone_layout((1000, 2000), target_h=500)
        self.assertEqual((w, h), (250, 500))

    def test_right_aligned_with_margin(self):
        w, _, x, _ = phone_layout((1000, 2000), target_h=500, margin_right=40)
        self.assertEqual(x + w + 40, W)

    def test_vertically_centered(self):
        _, h, _, y = phone_layout((1000, 2000), target_h=500)
        self.assertEqual(y, (H - h) // 2)

    def test_stays_inside_the_canvas_for_the_real_phone_size(self):
        w, h, x, y = phone_layout((780, 1688))
        self.assertGreaterEqual(x, 0)
        self.assertGreaterEqual(y, 0)
        self.assertLessEqual(x + w, W)
        self.assertLessEqual(y + h, H)


if __name__ == "__main__":
    unittest.main()
