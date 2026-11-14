import unittest
from pathlib import Path

from lib.repo import ROOT, app_repo


class RepoPathsTest(unittest.TestCase):
    def test_root_is_the_repository_root(self):
        self.assertTrue((ROOT / "scripts" / "lib" / "repo.py").is_file())

    def test_app_repo_honours_env_override(self):
        self.assertEqual(app_repo({"GITBOBA_APP_REPO": "/x/app"}), Path("/x/app"))

    def test_app_repo_defaults_under_home(self):
        self.assertEqual(
            app_repo({}), Path.home() / "development" / "GitBobaApp"
        )

    def test_empty_env_value_falls_back_to_default(self):
        self.assertEqual(app_repo({"GITBOBA_APP_REPO": ""}), app_repo({}))


if __name__ == "__main__":
    unittest.main()
