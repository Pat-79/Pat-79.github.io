# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "awayfromhome-theme"
  spec.version       = "0.1.0"
  spec.authors       = ["Patrick"]
  spec.email         = ["noreply@example.com"]

  spec.summary       = "A reusable Jekyll theme for Away From Home sites."
  spec.description   = "A local-first Jekyll theme package that separates site design from site content."
  spec.homepage      = "https://example.com/awayfromhome-theme"
  spec.license       = "MIT"

  spec.files = Dir.chdir(__dir__) do
    Dir[
      "{_includes,_layouts,_sass,assets,lib}/**/*",
      "*.gemspec"
    ]
  end

  spec.required_ruby_version = ">= 3.0"

  spec.add_runtime_dependency "jekyll", ">= 4.3", "< 5.0"
end